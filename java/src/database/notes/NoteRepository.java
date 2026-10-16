package database.notes;

import database.PagedQuery;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;
import java.util.Map;
import prerna.engine.api.IRDBMSEngine;
import prerna.query.querystruct.SelectQueryStruct;
import prerna.query.querystruct.filters.SimpleQueryFilter;
import prerna.query.querystruct.selectors.QueryColumnSelector;
import prerna.util.QueryExecutionUtility;
import util.DateFormats;

// Repository: all SQL for one area lives here. Reads build a SEMOSS SelectQueryStruct
// (columns written table__column, aliased to the camelCase names the frontend reads) and
// run through QueryExecutionUtility; writes use a PreparedStatement on the reactor's
// connection, one statement per write.
public final class NoteRepository {

  // field = the JSON/alias name; selector = table__column. The first column is the default
  // sort. The kind decides how a value is filtered and serialized (date -> "yyyy-MM-dd",
  // instant -> ISO-8601 UTC).
  private static final List<PagedQuery.Column> NOTE_COLUMNS =
      List.of(
          PagedQuery.Column.instant("createdAt", "note__created_at"),
          PagedQuery.Column.text("noteId", "note__note_id"),
          PagedQuery.Column.text("title", "note__title"),
          PagedQuery.Column.date("dueDate", "note__due_date"),
          PagedQuery.Column.bool("isDone", "note__is_done"));

  private final IRDBMSEngine engine;
  private final Connection connection;

  public NoteRepository(IRDBMSEngine engine, Connection connection) {
    this.engine = engine;
    this.connection = connection;
  }

  // Paged, sortable, filterable list: { rows, totalCount }.
  public Map<String, Object> page(PagedQuery.Request request) {
    return PagedQuery.page(engine, PagedQuery.select(NOTE_COLUMNS), NOTE_COLUMNS, request);
  }

  // Returns null when there is no such note. Outside PagedQuery, dates go through
  // DateFormats - never return a raw SEMOSS date value.
  public Map<String, Object> findById(String noteId) {
    SelectQueryStruct query = PagedQuery.select(NOTE_COLUMNS);
    query.addSelector(new QueryColumnSelector("note__body", "body"));
    query.addExplicitFilter(SimpleQueryFilter.makeColToValFilter("note__note_id", "==", noteId));
    query.setLimit(1);
    List<Map<String, Object>> rows = QueryExecutionUtility.flushRsToMap(engine, query);
    if (rows.isEmpty()) {
      return null;
    }
    Map<String, Object> row = rows.get(0);
    row.put("dueDate", DateFormats.isoDate(row.get("dueDate")));
    row.put("createdAt", DateFormats.isoInstant(row.get("createdAt")));
    return row;
  }

  public void add(String noteId, String title, String body, String dueDate) throws SQLException {
    // created_at is stored as UTC (see sql/init.sql).
    String sql =
        "INSERT INTO note (note_id, title, body, due_date, is_done, created_at)"
            + " VALUES (?, ?, ?, ?::date, FALSE, NOW() AT TIME ZONE 'UTC')";
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      statement.setString(1, noteId);
      statement.setString(2, title);
      statement.setString(3, body);
      if (dueDate == null) {
        statement.setNull(4, Types.VARCHAR);
      } else {
        statement.setString(4, dueDate);
      }
      statement.executeUpdate();
    }
  }
}
