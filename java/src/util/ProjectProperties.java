package util;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import prerna.util.AssetUtility;
import prerna.util.Utility;

/**
 * Loads configuration from {@code java/project.properties} and exposes values to reactors.
 *
 * <p>This is a singleton: {@link reactors.AbstractProjectReactor} calls {@link
 * #getInstance(String)} during {@code preExecute()} to initialize it. After that, {@link
 * #getInstance()} returns the cached instance.
 *
 * <p>To add a new property:
 *
 * <p>1. Add the {@code key=value} to {@code java/project.properties} 2. Add a private field and
 * getter in this class 3. Read the value in {@link #loadProp(String)} using {@code
 * projectProperties.getProperty("yourKey")}
 */
public class ProjectProperties {

  private static final Logger LOGGER = LogManager.getLogger(ProjectProperties.class);

  private static ProjectProperties INSTANCE = null;

  // TODO: Add a field for each property you want to expose, e.g.:
  //   private String engineId;

  private ProjectProperties() {}

  /**
   * Returns the cached singleton.
   *
   * @return the singleton instance
   * @throws RuntimeException if {@link #getInstance(String)} hasn't been called yet
   */
  public static ProjectProperties getInstance() {
    if (INSTANCE == null) {
      throw new RuntimeException("Unable to load project configuration");
    }
    return INSTANCE;
  }

  /**
   * Returns the singleton, loading properties from disk on first call.
   *
   * @param projectId the SEMOSS project ID used to locate the properties file
   * @return the singleton instance
   */
  public static ProjectProperties getInstance(String projectId) {
    if (INSTANCE == null) {
      loadProp(projectId);
    }
    return INSTANCE;
  }

  /**
   * Reads {@code java/project.properties} and populates this instance's fields. If the file is
   * missing or unreadable, {@code INSTANCE} stays {@code null} and a warning is logged.
   *
   * @param projectId the SEMOSS project ID used to locate the properties file
   */
  private static void loadProp(String projectId) {
    ProjectProperties newInstance = new ProjectProperties();

    try (final FileInputStream fileIn =
        new FileInputStream(
            Utility.normalizePath(
                AssetUtility.getProjectAssetsFolder(projectId) + "/java/project.properties"))) {
      Properties projectProperties = new Properties();
      projectProperties.load(fileIn);

      // TODO: Read properties and assign to fields, e.g.:
      //   newInstance.engineId = projectProperties.getProperty("engineId");

      INSTANCE = newInstance;
    } catch (IOException e) {
      INSTANCE = null;
      LOGGER.warn("java/project.properties not defined");
    }
  }

  // TODO: Add getters for each property, e.g.:
  //   public String getEngineId() { return engineId; }

}
