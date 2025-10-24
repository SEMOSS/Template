package reactors;

import domain.base.ErrorCode;
import domain.base.ProjectException;
import java.util.List;
import java.util.Map;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import prerna.auth.User;
import prerna.reactor.AbstractReactor;
import prerna.sablecc2.om.GenRowStruct;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.PixelOperationType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import util.ProjectProperties;

/**
 * Abstract base class for all project-specific reactors that provides common functionality and
 * standardized error handling for reactor implementations.
 *
 * <p>This class extends {@link AbstractReactor} and provides a framework for implementing
 * project-specific business logic with built-in error handling, user context management, and
 * project property access.
 *
 * <p>All concrete reactor implementations should extend this class and implement the {@link
 * #doExecute()} method to define their specific business logic.
 *
 * @see {@link AbstractReactor} for the base reactor functionality
 * @see {@link ProjectException} for standardized error handling
 * @see {@link ProjectProperties} for project configuration access
 */
public abstract class AbstractProjectReactor extends AbstractReactor {

  /** Logger instance for this class, used for logging reactor execution and errors. */
  private static final Logger LOGGER = LogManager.getLogger(AbstractProjectReactor.class);

  /** The current user context for this reactor execution. */
  protected User user;

  /** The project identifier associated with this reactor execution. */
  protected String projectId;

  /** Project-specific properties and configuration settings. */
  protected ProjectProperties projectProperties;

  // TODO: Initialize additional protected variables (engines, external services,
  // etc.)

  /** The result of the reactor execution, containing the output data and metadata. */
  protected NounMetadata result = null;

  /**
   * Executes the reactor with standardized error handling and logging. This method orchestrates the
   * reactor execution by calling {@link #preExecute()} for setup and then {@link #doExecute()} for
   * the actual business logic.
   *
   * <p>Any exceptions thrown during execution are caught and converted into standardized error
   * responses using {@link ProjectException} for consistent error handling.
   *
   * @return The result of the reactor execution as {@link NounMetadata}
   * @see {@link #preExecute()} for initialization logic
   * @see {@link #doExecute()} for business logic implementation
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
   * Performs pre-execution setup and initialization of protected variables. This method is called
   * before {@link #doExecute()} and handles common initialization tasks such as extracting project
   * context, loading project properties, and setting up the user context.
   *
   * <p>Subclasses can override this method to add additional initialization logic, but should call
   * {@code super.preExecute()} to ensure proper base initialization.
   *
   * @see {@link ProjectProperties#getInstance(String)} for project property loading
   */
  protected void preExecute() {
    projectId = this.insight.getContextProjectId();
    if (projectId == null) {
      projectId = this.insight.getProjectId();
    }

    projectProperties = ProjectProperties.getInstance(projectId);

    // TODO: Initialize additional resources (engines, external services, etc.)

    user = this.insight.getUser();
    organizeKeys();
  }

  /**
   * Retrieves a map parameter by name from the reactor's input parameters. This method first checks
   * the reactor's store for a named parameter, and if not found, looks for map inputs in the
   * current row.
   *
   * <p>This utility method simplifies access to map-type parameters passed to the reactor and
   * handles the common pattern of parameter retrieval with fallback logic.
   *
   * @param paramName The name of the parameter to retrieve
   * @return The map parameter value, or null if no map parameter is found
   */
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

  /**
   * Executes the main business logic of the reactor. This abstract method must be implemented by
   * concrete reactor classes to define their specific functionality and processing logic.
   *
   * <p>This method is called after {@link #preExecute()} has completed the initialization and
   * should return the result of the reactor's operation.
   *
   * @return The result of the reactor execution as {@link NounMetadata}
   */
  protected abstract NounMetadata doExecute();
}
