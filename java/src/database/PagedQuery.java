package database;

import java.math.BigDecimal;
import java.sql.Array;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import prerna.engine.api.IRDBMSEngine;
import prerna.query.interpreters.IQueryInterpreter;
import prerna.query.querystruct.SelectQueryStruct;
import prerna.query.querystruct.filters.SimpleQueryFilter;
import prerna.query.querystruct.selectors.QueryColumnOrderBySelector;
import prerna.query.querystruct.selectors.QueryColumnSelector;
import prerna.query.querystruct.selectors.QueryOpaqueSelector;
import prerna.util.QueryExecutionUtility;
import util.AppException;
import util.DateFormats;
import util.ErrorCode;

/** Adapts the DataTable (server mode) request shape to SEMOSS query structures. */
public final class PagedQuery {
  public static final String SORT_FIELD = "sortField";
  public static final String SORT_DIRECTION = "sortDirection";
  public static final String LIMIT = "limit";
  public static final String OFFSET = "offset";
  public static final String FILTERS = "filters";
  private static final String SOURCE_ALIAS = "paged_source";

  private enum Kind {
    TEXT,
    NUMBER,
    BOOLEAN,
    TEXT_ARRAY,
    DATE,
    INSTANT
  }

  public record Column(String field, String selector, Kind kind) {
    public static Column text(String field) {
      return text(field, field);
    }

    public static Column text(String field, String selector) {
      return new Column(field, selector, Kind.TEXT);
    }

    public static Column number(String field) {
      return number(field, field);
    }

    public static Column number(String field, String selector) {
      return new Column(field, selector, Kind.NUMBER);
    }

    public static Column bool(String field) {
      return bool(field, field);
    }

    public static Column bool(String field, String selector) {
      return new Column(field, selector, Kind.BOOLEAN);
    }

    /** A calendar date, returned as "yyyy-MM-dd". */
    public static Column date(String field, String selector) {
      return new Column(field, selector, Kind.DATE);
    }

    /** A UTC timestamp, returned as an ISO-8601 instant. */
    public static Column instant(String field, String selector) {
      return new Column(field, selector, Kind.INSTANT);
    }

    public static Column textArray(String field) {
      return textArray(field, field);
    }

    public static Column textArray(String field, String selector) {
      return new Column(field, selector, Kind.TEXT_ARRAY);
    }
  }

  /** Largest page a caller can ask for; a limit outside 1..MAX_LIMIT is clamped into it. */
  public static final int MAX_LIMIT = 500;

  public record Request(
      String sortField, String sortDirection, int limit, int offset, List<Object> filters) {
    public Request {
      // A limit of 0 would mean "no limit" to the query layer, so it is never passed through.
      limit = Math.min(Math.max(1, limit), MAX_LIMIT);
      offset = Math.max(0, offset);
    }
  }

  private PagedQuery() {}

  /** Builds a simple source query from query-structure column names. */
  public static SelectQueryStruct select(List<Column> columns) {
    SelectQueryStruct query = new SelectQueryStruct();
    for (Column column : columns) {
      query.addSelector(new QueryColumnSelector(column.selector(), column.field()));
    }
    return query;
  }

  /** Pages over a query-structure read model without requiring callers to write SQL. */
  public static Map<String, Object> page(
      IRDBMSEngine engine,
      SelectQueryStruct sourceQuery,
      List<Column> columns,
      Request request) {
    SelectQueryStruct query = derivedQuery(engine, sourceQuery);
    for (Column column : columns) {
      query.addSelector(new QueryColumnSelector(SOURCE_ALIAS + "__" + column.field(), column.field()));
    }
    query.addSelector(new QueryOpaqueSelector("COUNT(*) OVER()", "totalCount"));
    addFilters(query, columns, request.filters());
    Column defaultSort = columns.get(0);
    boolean hasSortField = request.sortField() != null && !request.sortField().isBlank();
    Column requestedSort =
        columns.stream()
            .filter(column -> column.field().equals(request.sortField()))
            .findFirst()
            .orElse(defaultSort);
    if (hasSortField && !requestedSort.field().equals(request.sortField())) {
      throw new AppException(ErrorCode.INVALID_INPUT, "Unknown sort field: " + request.sortField());
    }
    String direction = "desc".equalsIgnoreCase(request.sortDirection()) ? "DESC" : "ASC";
    query.addOrderBy(new QueryColumnOrderBySelector(SOURCE_ALIAS + "__" + requestedSort.field(), direction));
    if (!requestedSort.equals(defaultSort)) {
      query.addOrderBy(new QueryColumnOrderBySelector(SOURCE_ALIAS + "__" + defaultSort.field(), "ASC"));
    }
    query.setLimit(request.limit());
    query.setOffSet(request.offset());

    List<Map<String, Object>> rows = QueryExecutionUtility.flushRsToMap(engine, query);
    long totalCount = 0;
    for (Map<String, Object> row : rows) {
      Object count = row.remove("totalCount");
      if (count instanceof Number number) totalCount = number.longValue();
      normalizeArrays(row, columns);
      normalizeDates(row, columns);
    }
    // A window count is absent when OFFSET is beyond the final row (or LIMIT is zero).
    // Run the dedicated count only for that edge case so the UI can still reset to a
    // valid page without receiving a false total of zero.
    if (rows.isEmpty()) {
      totalCount = count(engine, sourceQuery, columns, request.filters());
    }
    return Map.of("rows", rows, "totalCount", totalCount);
  }

  /** Counts a filtered query-structure read model without requiring callers to write SQL. */
  public static long count(
      IRDBMSEngine engine,
      SelectQueryStruct sourceQuery,
      List<Column> columns,
      List<Object> filters) {
    SelectQueryStruct query = derivedQuery(engine, sourceQuery);
    query.addSelector(new QueryOpaqueSelector("COUNT(*)", "totalCount"));
    addFilters(query, columns, filters);
    List<Map<String, Object>> rows = QueryExecutionUtility.flushRsToMap(engine, query);
    if (rows.isEmpty()) return 0;
    Object count = rows.get(0).get("totalCount");
    return count instanceof Number number ? number.longValue() : 0;
  }

  private static SelectQueryStruct derivedQuery(
      IRDBMSEngine engine, SelectQueryStruct sourceQuery) {
    IQueryInterpreter interpreter = engine.getQueryInterpreter();
    interpreter.setQueryStruct(sourceQuery);
    SelectQueryStruct query = new SelectQueryStruct();
    query.setCustomFrom(interpreter.composeQuery());
    query.setCustomFromAliasName(SOURCE_ALIAS);
    return query;
  }

  private static void addFilters(SelectQueryStruct query, List<Column> columns, List<Object> filters) {
    if (filters == null) return;
    Map<String, Column> allowed = new HashMap<>();
    for (Column column : columns) allowed.put(column.field(), column);
    for (Object raw : filters) {
      if (!(raw instanceof Map<?, ?> filter) || !(filter.get("id") instanceof String field)) continue;
      Column column = allowed.get(field);
      Object value = filter.get("value");
      if (column == null || value == null) continue;
      String selector = SOURCE_ALIAS + "__" + field;
      if (column.kind() == Kind.DATE || column.kind() == Kind.INSTANT) {
        addDateFilter(query, column, selector, value);
        continue;
      }
      if (value instanceof List<?> values) {
        List<Object> typed = values.stream().filter(item -> item != null && !item.toString().isBlank())
            .map(item -> typedValue(column, item)).toList();
        if (!typed.isEmpty()) query.addExplicitFilter(SimpleQueryFilter.makeColToValFilter(selector, "==", typed));
      } else if (!value.toString().isBlank()) {
        if (column.kind() != Kind.NUMBER && column.kind() != Kind.BOOLEAN) {
          query.addExplicitFilter(
              SimpleQueryFilter.makeColToValFilter(selector, "?like", "%" + value + "%"));
        } else {
          query.addExplicitFilter(
              SimpleQueryFilter.makeColToValFilter(selector, "==", typedValue(column, value)));
        }
      }
    }
  }

  private static final DateTimeFormatter UTC_TIMESTAMP =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneOffset.UTC);

  /**
   * A DATE column filters on one "yyyy-MM-dd". An INSTANT column filters on a UTC interval
   * "start/end" of ISO-8601 instants (end exclusive); the UI turns the day a user picks in their
   * zone into that interval.
   */
  private static void addDateFilter(
      SelectQueryStruct query, Column column, String selector, Object value) {
    String input = value instanceof List<?> ? null : value.toString().trim();
    if (input != null && input.isEmpty()) return;
    try {
      if (input == null) throw new DateTimeParseException("List value", "", 0);
      if (column.kind() == Kind.DATE) {
        query.addExplicitFilter(
            SimpleQueryFilter.makeColToValFilter(selector, "==", LocalDate.parse(input).toString()));
        return;
      }
      String[] bounds = input.split("/");
      if (bounds.length != 2) throw new DateTimeParseException("Not an interval", input, 0);
      query.addExplicitFilter(
          SimpleQueryFilter.makeColToValFilter(
              selector, ">=", UTC_TIMESTAMP.format(Instant.parse(bounds[0]))));
      query.addExplicitFilter(
          SimpleQueryFilter.makeColToValFilter(
              selector, "<", UTC_TIMESTAMP.format(Instant.parse(bounds[1]))));
    } catch (DateTimeParseException e) {
      throw new AppException(
          ErrorCode.INVALID_INPUT,
          "Invalid filter for "
              + column.field()
              + ": expected "
              + (column.kind() == Kind.DATE ? "a yyyy-MM-dd date" : "a start/end ISO-8601 instant interval"));
    }
  }

  private static Object typedValue(Column column, Object value) {
    if (column.kind() == Kind.BOOLEAN) return Boolean.valueOf(value.toString());
    if (column.kind() == Kind.NUMBER) return new BigDecimal(value.toString());
    return value.toString();
  }

  private static void normalizeArrays(Map<String, Object> row, List<Column> columns) {
    for (Column column : columns) {
      if (column.kind() != Kind.TEXT_ARRAY) continue;
      Object value = row.get(column.field());
      if (value instanceof Array array) {
        try {
          Object[] elements = (Object[]) array.getArray();
          List<String> strings = new ArrayList<>();
          for (Object element : elements) if (element != null) strings.add(element.toString());
          row.put(column.field(), strings);
        } catch (SQLException e) {
          throw new IllegalArgumentException("Unable to read array column " + column.field(), e);
        }
      }
    }
  }

  private static void normalizeDates(Map<String, Object> row, List<Column> columns) {
    for (Column column : columns) {
      if (column.kind() == Kind.DATE) {
        row.put(column.field(), DateFormats.isoDate(row.get(column.field())));
      } else if (column.kind() == Kind.INSTANT) {
        row.put(column.field(), DateFormats.isoInstant(row.get(column.field())));
      }
    }
  }

  public static String descriptionForKey(String key) {
    return switch (key) {
      case SORT_FIELD -> "Column to sort by; omit for the default sort.";
      case SORT_DIRECTION -> "Sort direction: asc or desc.";
      case LIMIT -> "Maximum number of rows to return.";
      case OFFSET -> "Number of rows to skip.";
      case FILTERS -> "List of {id, value} column filters.";
      default -> null;
    };
  }
}
