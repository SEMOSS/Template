package util;

import domain.base.ErrorCode;
import domain.base.ProjectException;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import prerna.util.AssetUtility;
import prerna.util.Utility;

/**
 * Singleton class responsible for loading and managing project-specific configuration properties.
 *
 * <p>This class implements the Singleton pattern to ensure that project configuration is loaded
 * once and shared across all components within the same project context. It reads configuration
 * properties from a project-specific properties file and provides thread-safe access to these
 * configuration values throughout the application lifecycle.
 *
 * <p>The class automatically locates and loads the project.properties file from the project's Java
 * assets directory, providing a centralized configuration management mechanism that supports
 * project-specific customization while maintaining system-wide consistency.
 *
 * <p>Key features include:
 *
 * <ul>
 *   <li>Singleton pattern implementation for configuration consistency
 *   <li>Automatic properties file loading from project assets
 *   <li>Comprehensive error handling for configuration loading failures
 *   <li>Type-safe property access through getter methods
 *   <li>Integration with SEMOSS asset management utilities
 * </ul>
 *
 * <p>The configuration properties are loaded from: {@code
 * [project-assets-folder]/java/project.properties}
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
 * @see Properties
 * @see AssetUtility
 * @see ProjectException
 */
public class ProjectProperties {

  /** The singleton instance of ProjectProperties. */
  private static ProjectProperties INSTANCE = null;

  /** The database identifier configured for this project. */
  private String databaseId;

  /**
   * Private constructor to enforce singleton pattern.
   *
   * <p>This constructor is intentionally private to prevent direct instantiation. Use {@link
   * #getInstance()} or {@link #getInstance(String)} to obtain the singleton instance.
   */
  private ProjectProperties() {}

  /**
   * Returns the singleton instance of ProjectProperties.
   *
   * <p>This method provides access to the already-initialized singleton instance. It should only be
   * called after the instance has been properly initialized using {@link #getInstance(String)} with
   * a valid project ID.
   *
   * @return the singleton ProjectProperties instance
   * @throws ProjectException with {@link ErrorCode#INTERNAL_SERVER_ERROR} if the instance has not
   *     been initialized
   * @see #getInstance(String)
   */
  public static ProjectProperties getInstance() {
    if (INSTANCE == null) {
      throw new ProjectException(
          ErrorCode.INTERNAL_SERVER_ERROR, "Unable to load project configuration");
    }
    return INSTANCE;
  }

  /**
   * Returns the singleton instance of ProjectProperties, initializing it if necessary.
   *
   * <p>This method provides lazy initialization of the singleton instance. If the instance has not
   * been created yet, it will load the project configuration from the properties file associated
   * with the specified project ID. Subsequent calls will return the same instance regardless of the
   * project ID parameter.
   *
   * <p>This method is thread-safe for the initialization process, but once initialized, the
   * instance is shared across all threads.
   *
   * @param projectId the unique identifier of the project for which to load configuration
   * @return the singleton ProjectProperties instance
   * @throws ProjectException with {@link ErrorCode#INTERNAL_SERVER_ERROR} if configuration loading
   *     fails
   * @see #loadProp(String)
   */
  public static ProjectProperties getInstance(String projectId) {
    if (INSTANCE == null) {
      loadProp(projectId);
    }
    return INSTANCE;
  }

  /**
   * Loads project configuration properties from the project-specific properties file.
   *
   * <p>This method performs the actual loading of configuration properties from the file system. It
   * constructs the path to the project.properties file using the project ID and SEMOSS asset
   * utilities, then reads and parses the properties file to populate the singleton instance.
   *
   * <p>The loading process:
   *
   * <ol>
   *   <li>Creates a new ProjectProperties instance
   *   <li>Constructs the path to the project.properties file
   *   <li>Opens and reads the properties file using a FileInputStream
   *   <li>Extracts specific property values and assigns them to instance fields
   *   <li>Sets the singleton INSTANCE to the newly created instance
   * </ol>
   *
   * <p>The properties file is expected to be located at: {@code
   * [project-assets-folder]/java/project.properties}
   *
   * @param projectId the unique identifier of the project for which to load configuration
   * @throws ProjectException with {@link ErrorCode#INTERNAL_SERVER_ERROR} if the properties file
   *     cannot be read or parsed
   * @see AssetUtility#getProjectAssetsFolder(String)
   * @see Utility#normalizePath(String)
   * @see Properties#load(java.io.InputStream)
   */
  private static void loadProp(String projectId) {
    ProjectProperties newInstance = new ProjectProperties();

    try (final FileInputStream fileIn =
        new FileInputStream(
            Utility.normalizePath(
                AssetUtility.getProjectAssetsFolder(projectId) + "/java/project.properties"))) {
      Properties projectProperties = new Properties();
      projectProperties.load(fileIn);

      // Extract and assign property values to instance fields
      newInstance.databaseId = projectProperties.getProperty("databaseId");

      INSTANCE = newInstance;
    } catch (IOException e) {
      INSTANCE = null;
      throw new ProjectException(
          ErrorCode.INTERNAL_SERVER_ERROR, "Unable to load project configuration", e);
    }
  }

  /**
   * Returns the database identifier configured for this project.
   *
   * <p>This method provides access to the database ID that has been configured for the current
   * project through the project.properties file. The database ID is used throughout the system to
   * establish connections to the appropriate database instance for project-specific operations.
   *
   * @return the database identifier string, or null if not configured
   * @see #loadProp(String)
   */
  public String getDatabaseId() {
    return databaseId;
  }
}
