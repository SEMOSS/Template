package database.users;

import java.util.List;
import java.util.Map;
import prerna.engine.api.IRDBMSEngine;
import prerna.query.querystruct.SelectQueryStruct;
import prerna.query.querystruct.filters.SimpleQueryFilter;
import prerna.query.querystruct.selectors.QueryColumnSelector;
import prerna.util.QueryExecutionUtility;

public final class AppUserRepository {
  private final IRDBMSEngine engine;

  public AppUserRepository(IRDBMSEngine engine) {
    this.engine = engine;
  }

  // Returns the caller's app_user row, or null if they have none.
  public Map<String, Object> findByUserId(String userId) {
    SelectQueryStruct query = new SelectQueryStruct();
    query.addSelector(new QueryColumnSelector("app_user__user_id", "userId"));
    query.addSelector(new QueryColumnSelector("app_user__first_name", "firstName"));
    query.addSelector(new QueryColumnSelector("app_user__last_name", "lastName"));
    query.addSelector(new QueryColumnSelector("app_user__email", "email"));
    query.addSelector(new QueryColumnSelector("app_user__is_inactive", "isInactive"));
    query.addExplicitFilter(SimpleQueryFilter.makeColToValFilter("app_user__user_id", "==", userId));
    query.setLimit(1);
    List<Map<String, Object>> rows = QueryExecutionUtility.flushRsToMap(engine, query);
    return rows.isEmpty() ? null : rows.get(0);
  }
}
