package util;

/**
 * Utility class that holds project-wide constants and configuration values. This class provides a
 * centralized location for defining constants that are used across multiple classes and components
 * within the project.
 *
 * <p>This utility class is designed to contain static final fields that represent immutable
 * configuration values, string literals, numeric constants, and other project-specific constants
 * that need to be shared across the application.
 *
 * <p>As a utility class, this class should not be instantiated and all members should be static and
 * public for easy access throughout the project.
 */
public class Constants {

  /** Parameter key constant for animal unique identifier values. */
  public static final String ANIMAL_ID = "animalId";

  /** Parameter key constant for animal name values. */
  public static final String ANIMAL_NAME = "animalName";

  /** Parameter key constant for animal type or species classification values. */
  public static final String ANIMAL_TYPE = "animalType";

  /** Parameter key constant for animal date of birth values. */
  public static final String DATE_OF_BIRTH = "dateOfBirth";
}
