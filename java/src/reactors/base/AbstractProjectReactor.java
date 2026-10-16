package reactors.base;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import prerna.auth.User;
import prerna.engine.api.IEngine;
import prerna.engine.api.IRDBMSEngine;
import prerna.reactor.AbstractReactor;
import prerna.sablecc2.om.GenRowStruct;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.PixelOperationType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import prerna.util.Utility;
import util.AppException;
import util.ErrorCode;
import util.ProjectProperties;

// Base class for all reactors in this project.
//
// Every reactor you create should extend this class instead of AbstractReactor directly.
// It handles:
//   - SEMOSS initialization (project ID, user context, project properties)
//   - Standardized error handling (exceptions become error responses, not crashes)
//   - Common helper methods (e.g. getMap for map-type parameters)
//
// To create a new reactor:
//   1. Create a new class under reactors/<area>/ extending AbstractProjectReactor
//   2. Define keysToGet (parameter names) and keyRequired (1=required, 0=optional) in the
// constructor
//   3. Implement doExecute() with your business logic
//   4. Access parameters via this.keyValue.get("paramName") after organizeKeys() runs
//   5. Return results as NounMetadata (strings, maps, etc.)
//
// See reactors/notes/GetNotesReactor.java for a working example.
public abstract class AbstractProjectReactor extends AbstractReactor {

  private static final Logger LOGGER = LogManager.getLogger(AbstractProjectReactor.class);

  // These protected variables are available in all subclass reactors
  protected User user; // The authenticated user running this reactor
  protected String projectId; // The SEMOSS project/app ID
  protected ProjectProperties projectProperties; // Values from java/project.properties

  // The app's primary database (databaseId in java/project.properties), or null if none
  // is configured. Use requireDatabase() when a reactor can't work without it.
  protected IRDBMSEngine database;
  // Opened once in preExecute() and released after doExecute() runs (see execute()).
  // Use this for raw JDBC instead of opening your own connection. Null if no database.
  protected Connection connection;

  // TODO: Initialize additional protected variables (other engines, external services,
  // etc.)

  protected NounMetadata result = null;

  // Runs preExecute() for setup, then doExecute() for business logic.
  // If anything throws, the error is logged and returned as an ERROR pixel whose output
  // is { code, message }. Throw an AppException for a specific, expected outcome (e.g.
  // NOT_FOUND); any other exception is wrapped as ErrorCode.INTERNAL_ERROR. Don't build
  // errors with NounMetadata.getErrorNounMessage - the frontend expects { code, message }.
  @Override
  public NounMetadata execute() {
    try {
      preExecute();
      return doExecute();
    } catch (Exception e) {
      LOGGER.error(String.format("Reactor %s threw an error", this.getClass().getSimpleName()), e);
      AppException appException =
          e instanceof AppException
              ? (AppException) e
              : new AppException(ErrorCode.INTERNAL_ERROR, e.getMessage());
      return new NounMetadata(appException.toMap(), PixelDataType.MAP, PixelOperationType.ERROR);
    } finally {
      releaseConnection(connection);
    }
  }

  // Sets up project context before your reactor logic runs.
  // Override this to add your own initialization (e.g. loading engines),
  // but always call super.preExecute() first.
  protected void preExecute() {
    // Resolve the project ID from the insight context
    projectId = this.insight.getContextProjectId();
    if (projectId == null) {
      projectId = this.insight.getProjectId();
    }

    // Load properties from java/project.properties (e.g. engine IDs, config values)
    projectProperties = ProjectProperties.getInstance(projectId);

    openDatabase();

    // TODO: Initialize additional resources (other engines, external services, etc.)

    // Get the authenticated user and parse input parameters
    user = this.insight.getUser();
    organizeKeys(); // Populates this.keyValue from the Pixel command arguments
  }

  // Resolves the database engine from databaseId and opens a connection. Skipped when the
  // app has no databaseId configured; fails loudly if one is set but doesn't resolve.
  private void openDatabase() {
    String databaseId = projectProperties == null ? null : projectProperties.getDatabaseId();
    if (databaseId == null || databaseId.isBlank()) {
      return;
    }
    IEngine engine = Utility.getEngine(databaseId);
    if (!(engine instanceof IRDBMSEngine)) {
      throw new IllegalStateException(
          "Unable to find a relational database engine with id '"
              + databaseId
              + "' - check databaseId in java/project.properties");
    }
    database = (IRDBMSEngine) engine;
    try {
      connection = database.getConnection();
    } catch (SQLException e) {
      throw new AppException(ErrorCode.INTERNAL_ERROR, "Error connecting to the database");
    }
  }

  // Call from a reactor/service that can't work without a database.
  protected IRDBMSEngine requireDatabase() {
    if (database == null) {
      throw new IllegalStateException(
          "No database configured - set databaseId in java/project.properties");
    }
    return database;
  }

  // Without USE_CONNECTION_POOLING set, getConnection() returns the engine's one shared
  // connection, not an independent one - closing it would kill every other in-flight
  // reactor call using it too (intermittent "I/O error" failures under concurrent
  // requests). This only closes when the engine pools connections.
  private void releaseConnection(Connection toRelease) {
    if (toRelease == null || database == null || !database.isConnectionPooling()) {
      return;
    }
    try {
      toRelease.close();
    } catch (SQLException e) {
      LOGGER.warn("Failed to close database connection", e);
    }
  }

  // Helper to extract a Map parameter from the Pixel command.
  // Useful when the frontend passes JSON objects as parameters.
  // Returns null if no map parameter is found.
  @SuppressWarnings("unchecked")
  protected Map<String, Object> getMap(String paramName) {
    GenRowStruct mapGrs = this.store.getGenRowStruct(paramName);
    if (mapGrs != null && !mapGrs.isEmpty()) {
      List<NounMetadata> mapInputs = mapGrs.getNounsOfType(PixelDataType.MAP);
      if (mapInputs != null && !mapInputs.isEmpty()) {
        return (Map<String, Object>) mapInputs.get(0).getValue();
      }
    }

    List<NounMetadata> mapInputs = this.curRow.getNounsOfType(PixelDataType.MAP);
    if (mapInputs != null && !mapInputs.isEmpty()) {
      return (Map<String, Object>) mapInputs.get(0).getValue();
    }

    return null;
  }

  // Helper to extract an array parameter (e.g. filters=[{...}, {...}]). Each top-level
  // array element arrives as its own noun in the GenRowStruct, not as a single VECTOR
  // noun wrapping a Java List, so this reads every noun via getAllValues(). Returns null
  // if the parameter wasn't passed.
  protected List<Object> getList(String paramName) {
    GenRowStruct listGrs = this.store.getGenRowStruct(paramName);
    if (listGrs != null && !listGrs.isEmpty()) {
      return listGrs.getAllValues();
    }
    return null;
  }

  // Name of the logged-in user. getUsername() alone is null for non-native logins (e.g.
  // SSO), so this falls back to name/email via getResolvedUsername().
  protected String getCurrentUsername() {
    return user.getAccessToken(user.getPrimaryLogin()).getResolvedUsername();
  }

  // Implement this in your reactor subclass.
  // This is where your business logic goes. Access parameters via this.keyValue.
  // Return your result wrapped in NounMetadata.
  protected abstract NounMetadata doExecute();
}
