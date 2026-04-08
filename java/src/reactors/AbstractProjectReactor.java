package reactors;

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
 * Base class for all reactors in this project.
 *
 * <p>Every reactor you create should extend this class instead of {@link AbstractReactor} directly.
 * It handles:
 *
 * <p>- SEMOSS initialization (project ID, user context, project properties) - Standardized error
 * handling (exceptions become error responses, not crashes) - Common helper methods (e.g. {@link
 * #getMap(String)} for map-type parameters)
 *
 * <p>To create a new reactor:
 *
 * <p>1. Create a new class in this folder extending {@code AbstractProjectReactor} 2. Define {@code
 * keysToGet} (parameter names) and {@code keyRequired} (1=required, 0=optional) in the constructor
 * 3. Implement {@link #doExecute()} with your business logic 4. Access parameters via {@code
 * this.keyValue.get("paramName")} after {@link #organizeKeys()} runs 5. Return results as {@link
 * NounMetadata} (strings, maps, etc.)
 *
 * @see GetWeatherReactor
 */
public abstract class AbstractProjectReactor extends AbstractReactor {

  private static final Logger LOGGER = LogManager.getLogger(AbstractProjectReactor.class);

  /** The authenticated user running this reactor. */
  protected User user;

  /** The SEMOSS project/app ID. */
  protected String projectId;

  /** Values from {@code java/project.properties}. */
  protected ProjectProperties projectProperties;

  /** Stores the reactor result. */
  protected NounMetadata result = null;

  /**
   * Runs {@link #preExecute()} for setup, then {@link #doExecute()} for business logic. If anything
   * throws, the error is logged and returned as an error response instead of crashing the reactor.
   *
   * @return the result of reactor execution, or an error response if an exception occurs
   */
  @Override
  public NounMetadata execute() {
    try {
      preExecute();
      return doExecute();
    } catch (Exception e) {
      LOGGER.error(String.format("Reactor %s threw an error", this.getClass().getSimpleName()), e);
      return new NounMetadata(e.getMessage(), PixelDataType.CONST_STRING, PixelOperationType.ERROR);
    }
  }

  /**
   * Sets up project context before your reactor logic runs. Override this to add your own
   * initialization (e.g. loading engines), but always call {@code super.preExecute()} first.
   */
  protected void preExecute() {
    // Resolve the project ID from the insight context
    projectId = this.insight.getContextProjectId();
    if (projectId == null) {
      projectId = this.insight.getProjectId();
    }

    // Load properties from java/project.properties (e.g. engine IDs, config values)
    projectProperties = ProjectProperties.getInstance(projectId);

    // TODO: Initialize additional resources (engines, external services, etc.)

    // Get the authenticated user and parse input parameters
    user = this.insight.getUser();
    organizeKeys(); // Populates this.keyValue from the Pixel command arguments
  }

  /**
   * Extracts a {@link Map} parameter from the Pixel command. Useful when the frontend passes JSON
   * objects as parameters.
   *
   * @param paramName the name of the map parameter to extract
   * @return the map value, or {@code null} if no map parameter is found
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
   * Implement this in your reactor subclass. This is where your business logic goes. Access
   * parameters via {@code this.keyValue}.
   *
   * @return the result wrapped in {@link NounMetadata}
   */
  protected abstract NounMetadata doExecute();
}
