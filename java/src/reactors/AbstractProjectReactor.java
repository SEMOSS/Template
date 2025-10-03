package reactors;

import domain.base.ErrorCode;
import domain.base.ProjectException;
import java.util.List;
import java.util.Map;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import prerna.auth.User;
import prerna.engine.impl.rdbms.RDBMSNativeEngine;
import prerna.reactor.AbstractReactor;
import prerna.sablecc2.om.GenRowStruct;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.PixelOperationType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import prerna.util.Utility;
import util.ProjectProperties;

/**
 * Abstract base class for all project-specific reactors in the system.
 *
 * <p>This class extends {@link AbstractReactor} and provides common functionality for project-based
 * operations including project context management, database connectivity, user authentication, and
 * standardized error handling.
 *
 * <p>All concrete reactor implementations should extend this class to inherit project-specific
 * capabilities and ensure consistent behavior across the system.
 *
 * <h3>Key Features:</h3>
 *
 * <ul>
 *   <li>Automatic project context initialization
 *   <li>Database connection management based on project configuration
 *   <li>User session handling
 *   <li>Standardized error handling with {@link ProjectException}
 *   <li>Access to project properties and configuration
 * </ul>
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
 * @see AbstractReactor
 * @see ProjectProperties
 * @see ProjectException
 */
public abstract class AbstractProjectReactor extends AbstractReactor {

  /** Logger instance for this class. */
  private static final Logger LOGGER = LogManager.getLogger(AbstractProjectReactor.class);

  /** The current user executing this reactor. */
  protected User user;

  /** The unique identifier of the project context. */
  protected String projectId;

  /** Configuration properties specific to the current project. */
  protected ProjectProperties projectProperties;

  /** The database identifier associated with the current project. */
  protected String databaseId;

  /** The database engine instance for executing database operations. */
  protected RDBMSNativeEngine database;

  /** The result metadata to be returned from the reactor execution. */
  protected NounMetadata result = null;

  /**
   * Executes the reactor with comprehensive error handling and project context initialization.
   *
   * <p>This method follows a template pattern where it first calls {@link #preExecute()} to
   * initialize the project context, then delegates to the concrete implementation via {@link
   * #doExecute()}. Any exceptions thrown during execution are caught and wrapped in a standardized
   * error response.
   *
   * <p>The execution flow:
   *
   * <ol>
   *   <li>Initialize project context via {@code preExecute()}
   *   <li>Execute business logic via {@code doExecute()}
   *   <li>Handle any exceptions and return appropriate error metadata
   * </ol>
   *
   * @return NounMetadata containing the execution result or error information
   * @throws RuntimeException if an unrecoverable error occurs during execution
   * @see #preExecute()
   * @see #doExecute()
   */
  @Override
  public NounMetadata execute() {
    try {
      preExecute();
      return doExecute();
    } catch (Exception e) {
      ProjectException ex = null;
      if (e instanceof ProjectException) {
        ex = (ProjectException) e;
      } else {
        ex = new ProjectException(ErrorCode.INTERNAL_SERVER_ERROR, e);
      }
      LOGGER.error(String.format("Reactor %s threw an error", this.getClass().getSimpleName()), e);

      return new NounMetadata(ex.getAsMap(), PixelDataType.MAP, PixelOperationType.ERROR);
    }
  }

  /**
   * Initializes the project context and sets up required resources before execution.
   *
   * <p>This method performs the following initialization tasks:
   *
   * <ul>
   *   <li>Retrieves and sets the project ID from the insight context
   *   <li>Loads project-specific properties and configuration
   *   <li>Establishes database connection based on project settings
   *   <li>Sets the current user from the insight session
   *   <li>Organizes input parameters for processing
   * </ul>
   *
   * <p>This method is automatically called by {@link #execute()} before delegating to the concrete
   * implementation in {@link #doExecute()}.
   *
   * @see ProjectProperties#getInstance(String)
   * @see #execute()
   */
  protected void preExecute() {
    projectId = this.insight.getContextProjectId();
    if (projectId == null) {
      projectId = this.insight.getProjectId();
    }

    projectProperties = ProjectProperties.getInstance(projectId);

    // Update protected variables
    databaseId = projectProperties.getDatabaseId();
    if (databaseId != null) {
      database = (RDBMSNativeEngine) Utility.getDatabase(databaseId);
    }

    user = this.insight.getUser();

    organizeKeys();
  }

  /**
   * Retrieves a Map parameter from the reactor's input store or current row.
   *
   * <p>This utility method searches for a Map-type parameter in the following order:
   *
   * <ol>
   *   <li>First checks the named parameter store using {@code paramName}
   *   <li>If not found, searches the current row for any Map-type noun
   *   <li>Returns the first Map found, or {@code null} if none exist
   * </ol>
   *
   * <p>This method is commonly used to extract configuration or input data that has been passed to
   * the reactor as a Map structure.
   *
   * @param paramName the name of the parameter to search for in the store
   * @return a Map containing the parameter data, or {@code null} if not found
   * @see GenRowStruct#getNounsOfType(PixelDataType)
   */
  protected Map<String, Object> getMap(String paramName) {
    GenRowStruct mapGrs = this.store.getNoun(paramName);
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

  /**
   * Abstract method that concrete reactor implementations must provide.
   *
   * <p>This method contains the core business logic specific to each reactor. It is called by
   * {@link #execute()} after the project context has been properly initialized via {@link
   * #preExecute()}.
   *
   * <p>Implementations should:
   *
   * <ul>
   *   <li>Perform the specific business logic for the reactor
   *   <li>Use the initialized project context (user, database, properties)
   *   <li>Return appropriate NounMetadata representing the result
   *   <li>Throw {@link ProjectException} for business logic errors
   * </ul>
   *
   * @return NounMetadata containing the execution result
   * @throws ProjectException if a business logic error occurs
   * @throws RuntimeException if an unexpected error occurs
   * @see #execute()
   * @see #preExecute()
   */
  protected abstract NounMetadata doExecute();
}
