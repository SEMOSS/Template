package domain.examples.database;

import java.util.Map;
import prerna.date.SemossDate;

/**
 * Data model class representing an animal entity within the database system.
 *
 * <p>This class serves as a domain object for animal-related data operations, encapsulating all the
 * essential information about an animal including its unique identifier, type, name, and date of
 * birth. It provides a structured way to handle animal data throughout the system and supports
 * conversion to various formats for data persistence and API responses.
 *
 * <p>The class follows standard JavaBean conventions with getter and setter methods for all
 * properties, making it compatible with various serialization frameworks and data binding
 * mechanisms commonly used in enterprise applications.
 *
 * <p>Key features include:
 *
 * <ul>
 *   <li>Comprehensive animal data encapsulation
 *   <li>Integration with SEMOSS date handling through {@link SemossDate}
 *   <li>Map-based representation for database operations and API responses
 *   <li>Standard JavaBean property access patterns
 * </ul>
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
 * @see SemossDate
 */
public class AnimalData {

  /** The unique identifier for this animal instance. */
  private String animalId;

  /** The classification or species type of this animal. */
  private String animalType;

  /** The given name or designation of this animal. */
  private String animalName;

  /** The date when this animal was born, using SEMOSS date handling. */
  private SemossDate dateOfBirth;

  /**
   * Constructs a new AnimalData instance with all required animal information.
   *
   * <p>This constructor initializes a complete animal data object with all essential properties.
   * All parameters are required and should not be null to ensure data integrity.
   *
   * @param animalId the unique identifier for the animal
   * @param animalType the classification or species type of the animal
   * @param animalName the given name or designation of the animal
   * @param dateOfBirth the date when the animal was born
   */
  public AnimalData(String animalId, String animalType, String animalName, SemossDate dateOfBirth) {
    this.animalId = animalId;
    this.animalType = animalType;
    this.animalName = animalName;
    this.dateOfBirth = dateOfBirth;
  }

  /**
   * Returns the given name or designation of this animal.
   *
   * @return the animal's name
   */
  public String getAnimalName() {
    return animalName;
  }

  /**
   * Sets the given name or designation of this animal.
   *
   * @param animalName the new name for the animal
   */
  public void setAnimalName(String animalName) {
    this.animalName = animalName;
  }

  /**
   * Returns the unique identifier for this animal instance.
   *
   * @return the animal's unique identifier
   */
  public String getAnimalId() {
    return animalId;
  }

  /**
   * Sets the unique identifier for this animal instance.
   *
   * @param animalId the new unique identifier for the animal
   */
  public void setAnimalId(String animalId) {
    this.animalId = animalId;
  }

  /**
   * Returns the date when this animal was born.
   *
   * @return the animal's date of birth
   */
  public SemossDate getDateOfBirth() {
    return dateOfBirth;
  }

  /**
   * Sets the date when this animal was born.
   *
   * @param dateOfBirth the new date of birth for the animal
   */
  public void setDateOfBirth(SemossDate dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  /**
   * Returns the classification or species type of this animal.
   *
   * @return the animal's type or species classification
   */
  public String getAnimalType() {
    return animalType;
  }

  /**
   * Sets the classification or species type of this animal.
   *
   * @param animalType the new type or species classification for the animal
   */
  public void setAnimalType(String animalType) {
    this.animalType = animalType;
  }

  /**
   * Converts this animal data object into a Map representation suitable for database operations and
   * API responses.
   *
   * <p>This method creates a standardized Map containing all animal properties with
   * database-friendly keys. The resulting Map can be used for database insertion, API
   * serialization, or any other operation that requires a key-value representation of the animal
   * data.
   *
   * <p>The returned Map contains the following keys:
   *
   * <ul>
   *   <li>"animal_id" - the unique identifier
   *   <li>"animal_type" - the classification or species type
   *   <li>"animal_name" - the given name or designation
   *   <li>"date_of_birth" - the birth date as a {@link SemossDate} object
   * </ul>
   *
   * @return a Map representation of this animal data with database-friendly keys
   * @see Map#of(Object, Object, Object, Object, Object, Object, Object, Object)
   */
  public Map<String, Object> toMap() {
    return Map.of(
        "animal_id", animalId,
        "animal_type", animalType,
        "animal_name", animalName,
        "date_of_birth", dateOfBirth);
  }
}
