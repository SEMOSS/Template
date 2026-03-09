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

// Abstract base class for all project-specific reactors.
// Provides common functionality, standardized error handling, user context management,
// and project property access.
//
// Concrete reactor implementations should extend this class and implement doExecute().
public abstract class AbstractProjectReactor extends AbstractReactor {

  private static final Logger LOGGER = LogManager.getLogger(AbstractProjectReactor.class);

  protected User user;
  protected String projectId;
  protected ProjectProperties projectProperties;

  // TODO: Initialize additional protected variables (engines, external services,
  // etc.)

  protected NounMetadata result = null;

  // Runs preExecute() for setup, then doExecute() for business logic.
  // Exceptions are caught and returned as standardized error responses.
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

  // Initializes protected variables (projectId, projectProperties, user) before doExecute().
  // Subclasses can override but should call super.preExecute().
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

  // Retrieves a map parameter by name. Checks the store first, then falls back to curRow.
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

  // Implement this method in subclasses to define the reactor's business logic.
  // Called after preExecute() completes initialization.
  protected abstract NounMetadata doExecute();
}
