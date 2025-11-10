package reactors.examples.database;

import domain.base.ErrorCode;
import domain.base.ProjectException;
import domain.examples.database.AnimalData;
import java.util.UUID;
import org.apache.commons.lang3.StringUtils;
import prerna.date.SemossDate;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.AbstractProjectReactor;
import util.Constants;
import util.HelperMethods;

/**
 * Reactor responsible for adding new animal records to the database system.
 *
 * <p>This reactor provides the business logic for creating and persisting new animal entries in the
 * database. It handles input validation, data preparation, and delegates the actual database
 * operations to utility methods while ensuring data integrity and proper error handling.
 *
 * <p>The reactor requires three mandatory parameters: animal name, animal type, and date of birth.
 * It automatically generates a unique identifier for each new animal and formats the date according
 * to system standards before persisting the data.
 *
 * <p>Key functionality includes:
 *
 * <ul>
 *   <li>Input validation for all required animal attributes
 *   <li>Automatic generation of unique animal identifiers
 *   <li>Date formatting and validation using {@link SemossDate}
 *   <li>Database persistence through {@link HelperMethods#addAnimal}
 *   <li>Comprehensive error handling for invalid inputs
 * </ul>
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
 * @see AbstractProjectReactor
 * @see AnimalData
 * @see HelperMethods#addAnimal(prerna.engine.impl.rdbms.RDBMSNativeEngine, AnimalData)
 * @see Constants
 */
public class AddAnimalReactor extends AbstractProjectReactor {

  /**
   * Constructs a new AddAnimalReactor with configuration for required input parameters.
   *
   * <p>This constructor sets up the reactor to expect three mandatory parameters: animal name,
   * animal type, and date of birth. All parameters are marked as required to ensure complete animal
   * data is provided for successful database insertion.
   *
   * @see Constants#ANIMAL_NAME
   * @see Constants#ANIMAL_TYPE
   * @see Constants#DATE_OF_BIRTH
   * @see AbstractProjectReactor#keysToGet
   * @see AbstractProjectReactor#keyRequired
   */
  public AddAnimalReactor() {
    this.keysToGet =
        new String[] {Constants.ANIMAL_NAME, Constants.ANIMAL_TYPE, Constants.DATE_OF_BIRTH};
    this.keyRequired = new int[] {1, 1, 1};
  }

  /**
   * Executes the animal addition process with comprehensive validation and error handling.
   *
   * <p>This method retrieves and validates all required animal parameters, creates a new {@link
   * AnimalData} instance with a generated unique identifier, and persists the data to the database
   * through the utility layer.
   *
   * <p>The execution flow:
   *
   * <ol>
   *   <li>Retrieves animal name, type, and date of birth from input parameters
   *   <li>Validates that all required fields are present and not empty
   *   <li>Generates a unique UUID for the new animal
   *   <li>Creates and formats the date of birth using {@link SemossDate}
   *   <li>Constructs an {@link AnimalData} object with all validated information
   *   <li>Persists the animal data to the database
   *   <li>Returns a success indicator
   * </ol>
   *
   * @return {@link NounMetadata} containing a boolean true value indicating successful creation
   * @throws ProjectException with {@link ErrorCode#BAD_REQUEST} if any required parameters are
   *     missing or empty
   * @see AnimalData#AnimalData(String, String, String, SemossDate)
   * @see HelperMethods#addAnimal(prerna.engine.impl.rdbms.RDBMSNativeEngine, AnimalData)
   * @see UUID#randomUUID()
   * @see SemossDate#SemossDate(String, String)
   */
  @Override
  protected NounMetadata doExecute() {
    String animalName = this.keyValue.get(Constants.ANIMAL_NAME);
    String animalType = this.keyValue.get(Constants.ANIMAL_TYPE);
    String dateOfBirth = this.keyValue.get(Constants.DATE_OF_BIRTH);

    // Validate that all required parameters are present and not empty
    if (StringUtils.trimToNull(animalName) == null
        || StringUtils.trimToNull(animalType) == null
        || StringUtils.trimToNull(dateOfBirth) == null) {
      throw new ProjectException(
          ErrorCode.BAD_REQUEST, "Animal name, type, and date of birth cannot be empty");
    }

    // Create new animal data with generated unique identifier
    AnimalData animalData =
        new AnimalData(
            UUID.randomUUID().toString(),
            animalType,
            animalName,
            new SemossDate(dateOfBirth, "yyyy-MM-dd", null));

    // Persist the animal data to the database
    HelperMethods.addAnimal(database, animalData);

    return new NounMetadata(true, PixelDataType.BOOLEAN);
  }
}
