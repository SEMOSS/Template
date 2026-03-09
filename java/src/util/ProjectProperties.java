package util;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import prerna.util.AssetUtility;
import prerna.util.Utility;

// Singleton that loads and exposes project configuration from:
//   [projectId]/app_root/version/assets/java/project.properties
//
// Usage: call getInstance(projectId) once to initialize, then getInstance() thereafter.
public class ProjectProperties {

  private static final Logger LOGGER = LogManager.getLogger(ProjectProperties.class);

  private static ProjectProperties INSTANCE = null;

  // TODO: Add var for each property

  private ProjectProperties() {}

  // Returns the singleton instance. Throws if not yet initialized via getInstance(projectId).
  public static ProjectProperties getInstance() {
    if (INSTANCE == null) {
      throw new RuntimeException("Unable to load project configuration");
    }
    return INSTANCE;
  }

  // Lazily initializes the singleton by loading properties for the given projectId.
  public static ProjectProperties getInstance(String projectId) {
    if (INSTANCE == null) {
      loadProp(projectId);
    }
    return INSTANCE;
  }

  // Loads project.properties from the assets folder for the given projectId.
  // On failure, INSTANCE is set to null and a warning is logged.
  private static void loadProp(String projectId) {
    ProjectProperties newInstance = new ProjectProperties();

    try (final FileInputStream fileIn =
        new FileInputStream(
            Utility.normalizePath(
                AssetUtility.getProjectAssetsFolder(projectId) + "/java/project.properties"))) {
      Properties projectProperties = new Properties();
      projectProperties.load(fileIn);

      // TODO Add any properties to be read by the properties file and add the
      // corresponding getter.

      INSTANCE = newInstance;
    } catch (IOException e) {
      INSTANCE = null;
      LOGGER.warn("java/project.properties not defined");
    }
  }

  // TODO: Add getters for properties with appropriate JavaDoc linking to
  // individual property keys.

}
