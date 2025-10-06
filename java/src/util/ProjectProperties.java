package util;

import domain.base.ErrorCode;
import domain.base.ProjectException;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import prerna.util.AssetUtility;
import prerna.util.Utility;

public class ProjectProperties {

  /**
   * The singleton instance of ProjectProperties. This instance is initialized lazily when {@link
   * #getInstance(String)} is first called.
   */
  private static ProjectProperties INSTANCE = null;

  // Add var for each property
  private String databaseId;

  /**
   * Private constructor to prevent direct instantiation. This class follows the Singleton pattern
   * and should be accessed through {@link #getInstance()} or {@link #getInstance(String)} methods.
   */
  private ProjectProperties() {}

  /**
   * Returns the singleton instance of ProjectProperties. This method requires that the instance has
   * already been initialized with a project ID using {@link #getInstance(String)}. If the instance
   * has not been initialized, it throws a {@link ProjectException}.
   *
   * @return The singleton ProjectProperties instance
   * @throws ProjectException If the instance has not been initialized with a project ID
   * @see {@link #getInstance(String)} for initializing the instance
   */
  public static ProjectProperties getInstance() {
    if (INSTANCE == null) {
      throw new ProjectException(
          ErrorCode.INTERNAL_SERVER_ERROR, "Unable to load project configuration");
    }
    return INSTANCE;
  }

  /**
   * Returns the singleton instance of ProjectProperties, initializing it if necessary. If this is
   * the first call or the instance is null, this method loads the project properties from the
   * specified project's configuration file.
   *
   * @param projectId The project identifier used to locate the project.properties file
   * @return The singleton ProjectProperties instance
   * @throws ProjectException If there are issues loading the project configuration
   * @see {@link #loadProp(String)} for the actual property loading logic
   */
  public static ProjectProperties getInstance(String projectId) {
    if (INSTANCE == null) {
      loadProp(projectId);
    }
    return INSTANCE;
  }

  /**
   * Loads project properties from the project's configuration file and initializes the singleton
   * instance. This method reads the project.properties file from the project's assets folder and
   * populates the ProjectProperties instance with the loaded configuration values.
   *
   * <p>The properties file is expected to be located at:
   *
   * <pre>[projectId]/app_root/version/assets/java/project.properties</pre>
   *
   * <p>This method uses try-with-resources to ensure proper resource cleanup and handles any IO
   * exceptions by converting them to {@link ProjectException} instances.
   *
   * @param projectId The project identifier used to construct the path to the properties file
   * @throws ProjectException If there are IO errors reading the properties file
   * @see {@link Properties#load(java.io.InputStream)} for property file format requirements
   * @see {@link AssetUtility#getProjectAssetsFolder(String)} for asset folder resolution
   */
  private static void loadProp(String projectId) {
    ProjectProperties newInstance = new ProjectProperties();

    try (final FileInputStream fileIn =
        new FileInputStream(
            Utility.normalizePath(
                AssetUtility.getProjectAssetsFolder(projectId) + "/java/project.properties"))) {
      Properties projectProperties = new Properties();
      projectProperties.load(fileIn);

      // Add any properties to be read by the properties file and add the corresponding getter
      newInstance.databaseId = projectProperties.getProperty("databaseId");

      INSTANCE = newInstance;
    } catch (IOException e) {
      INSTANCE = null;
      throw new ProjectException(
          ErrorCode.INTERNAL_SERVER_ERROR, "Unable to load project configuration", e);
    }
  }

  // Add getters for properties
  public String getDatabaseId() {
    return databaseId;
  }
}
