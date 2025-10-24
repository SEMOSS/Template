package util;

import domain.base.ErrorCode;
import domain.base.ProjectException;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import prerna.util.AssetUtility;
import prerna.util.Utility;

/**
 * Singleton utility class responsible for loading and exposing project-specific configuration
 * properties. Properties are sourced from the project asset file located at:
 *
 * <pre>
 * [projectId]/app_root/version/assets/java/project.properties
 * </pre>
 *
 * <p>Invocation pattern:
 *
 * <ul>
 *   <li>Call {@link #getInstance(String)} once with a valid project identifier to lazily initialize
 *       and load the backing properties file.
 *   <li>Subsequent calls to {@link #getInstance()} retrieve the same initialized singleton
 *       instance.
 * </ul>
 *
 * <p>File format conforms to standard {@link Properties} loading rules: one property per line with
 * supported separators (whitespace, '=' or ':'). Custom project keys (e.g., <code>engineId</code>)
 * can be defined following that pattern:
 *
 * <pre>
 * engineId=fc6a3fab-2425-4987-be93-58ad2efeee24
 * </pre>
 *
 * <p>Error handling uses {@link ProjectException} wrapping {@link domain.base.ErrorCode} values to
 * provide consistent structured failure semantics when initialization or file IO fails.
 *
 * @see {@link ProjectException} for structured configuration load error reporting.
 * @see {@link #getInstance(String)} for initial lazy load of the singleton.
 * @see {@link Properties#load(java.io.InputStream)} for supported file parsing rules.
 */
public class ProjectProperties {

  /**
   * The singleton instance of ProjectProperties. This instance is initialized lazily when {@link
   * #getInstance(String)} is first called.
   */
  private static ProjectProperties INSTANCE = null;

  // TODO: Add var for each property

  /**
   * Private constructor to prevent direct instantiation.
   *
   * <p>This class follows the Singleton pattern and should be accessed exclusively through {@link
   * #getInstance()} or the lazy-loading {@link #getInstance(String)} initialization variant.
   */
  private ProjectProperties() {}

  /**
   * Returns the already-initialized singleton instance of {@link ProjectProperties}.
   *
   * <p>This accessor requires prior initialization through {@link #getInstance(String)}. If the
   * instance is still null, a {@link ProjectException} is thrown indicating an improper lifecycle
   * usage.
   *
   * @return The singleton {@link ProjectProperties} instance.
   * @throws ProjectException If the singleton has not yet been initialized.
   * @see {@link #getInstance(String)} for first-time initialization semantics.
   */
  public static ProjectProperties getInstance() {
    if (INSTANCE == null) {
      throw new ProjectException(
          ErrorCode.INTERNAL_SERVER_ERROR, "Unable to load project configuration");
    }
    return INSTANCE;
  }

  /**
   * Lazily initializes and returns the singleton instance of {@link ProjectProperties}. If no prior
   * instance exists, this method triggers a properties file load using the supplied project
   * identifier.
   *
   * @param projectId The project identifier used to locate the <code>project.properties</code>
   *     file.
   * @return The singleton {@link ProjectProperties} instance.
   * @throws ProjectException If an IO error occurs during property loading.
   * @see {@link #loadProp(String)} for internal file parsing and singleton assignment logic.
   */
  public static ProjectProperties getInstance(String projectId) {
    if (INSTANCE == null) {
      loadProp(projectId);
    }
    return INSTANCE;
  }

  /**
   * Internal helper that performs the actual loading of project configuration data into the
   * singleton instance. The method constructs the properties file path using the resolved assets
   * folder and delegates parsing to {@link Properties#load(java.io.InputStream)}.
   *
   * <p>Location pattern:
   *
   * <pre>
   * [projectId]/app_root/version/assets/java/project.properties
   * </pre>
   *
   * <p>Lifecycle notes:
   *
   * <ul>
   *   <li>On success, assigns the newly created instance to {@code INSTANCE}.
   *   <li>On failure (IO issues), resets {@code INSTANCE} to null and throws a {@link
   *       ProjectException} wrapping {@link domain.base.ErrorCode#INTERNAL_SERVER_ERROR}.
   * </ul>
   *
   * @param projectId The project identifier used to build the canonical properties file path.
   * @throws ProjectException If an {@link IOException} occurs during file access or parsing.
   * @see {@link AssetUtility#getProjectAssetsFolder(String)} for asset folder resolution logic.
   * @see {@link Properties#load(java.io.InputStream)} for specification-compliant parsing.
   */
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
      throw new ProjectException(
          ErrorCode.INTERNAL_SERVER_ERROR, "Unable to load project configuration", e);
    }
  }

  // TODO: Add getters for properties with appropriate JavaDoc linking to
  // individual property keys.

}
