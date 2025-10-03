package util;

/**
 * Utility class containing standardized constant values used throughout the project system.
 *
 * <p>This class serves as a central repository for string literals, parameter names, and other
 * constant values that are referenced across multiple components of the system. By centralizing
 * these constants, the system maintains consistency, reduces the risk of typos, and facilitates
 * easy maintenance when parameter names or other constant values need to be updated.
 *
 * <p>The constants defined here are primarily used for parameter key identification in reactor
 * implementations, database field mappings, and other system-wide references that require
 * consistent naming conventions.
 *
 * <p>All constants in this class are:
 *
 * <ul>
 *   <li>Declared as {@code public static final} for global accessibility
 *   <li>Named using standard Java constant naming conventions (UPPER_CASE_WITH_UNDERSCORES)
 *   <li>Thoroughly documented to explain their purpose and usage context
 * </ul>
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
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
