package reactors.examples.database;

import domain.base.ErrorCode;
import domain.base.ProjectException;
import java.util.List;
import java.util.Map;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.AbstractProjectReactor;
import util.Constants;
import util.HelperMethods;

/**
 * Reactor responsible for retrieving a specific animal record by its unique identifier.
 *
 * <p>This reactor provides targeted data retrieval functionality that allows clients to fetch
 * detailed information about a single animal using its unique ID. It includes comprehensive
 * validation and error handling to ensure data integrity and proper response handling for various
 * edge cases.
 *
 * <p>The reactor requires a single mandatory parameter (animal ID) and performs validation to
 * ensure that exactly one matching record is found. It handles common error scenarios such as
 * missing records and unexpected data integrity issues.
 *
 * <p>Key functionality includes:
 *
 * <ul>
 *   <li>Single animal record retrieval by unique identifier
 *   <li>Validation that exactly one record is found
 *   <li>Proper error handling for missing or duplicate records
 *   <li>Structured data return suitable for various consumption patterns
 * </ul>
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
 * @see AbstractProjectReactor
 * @see HelperMethods#getAnimalById(prerna.engine.impl.rdbms.RDBMSNativeEngine, String)
 * @see Constants#ANIMAL_ID
 */
public class GetAnimalByIdReactor extends AbstractProjectReactor {

  /**
   * Constructs a new GetAnimalByIdReactor with configuration for the required animal ID parameter.
   *
   * <p>This constructor sets up the reactor to expect a single mandatory parameter: the animal ID.
   * The animal ID is required to perform the targeted database lookup and ensure proper record
   * retrieval.
   *
   * @see Constants#ANIMAL_ID
   * @see AbstractProjectReactor#keysToGet
   * @see AbstractProjectReactor#keyRequired
   */
  public GetAnimalByIdReactor() {
    this.keysToGet = new String[] {Constants.ANIMAL_ID};
    this.keyRequired = new int[] {1};
  }

  /**
   * Executes the animal retrieval process for a specific animal ID with comprehensive validation.
   *
   * <p>This method retrieves the animal ID parameter, performs the database lookup, and validates
   * that exactly one matching record is found. It handles various error conditions to ensure proper
   * data integrity and user feedback.
   *
   * <p>The execution flow:
   *
   * <ol>
   *   <li>Retrieves the animal ID from the input parameters
   *   <li>Performs database lookup using {@link HelperMethods#getAnimalById}
   *   <li>Validates that exactly one record is returned
   *   <li>Extracts the single animal record from the result set
   *   <li>Returns the animal data as a map
   * </ol>
   *
   * <p>The method performs strict validation to ensure data integrity:
   *
   * <ul>
   *   <li>Throws {@link ProjectException} with {@link ErrorCode#NOT_FOUND} if no records are found
   *   <li>Throws {@link ProjectException} with {@link ErrorCode#INTERNAL_SERVER_ERROR} if multiple
   *       records are found
   * </ul>
   *
   * @return {@link NounMetadata} containing a map with the animal record data
   * @throws ProjectException with {@link ErrorCode#NOT_FOUND} if the animal ID does not exist
   * @throws ProjectException with {@link ErrorCode#INTERNAL_SERVER_ERROR} if multiple animals are
   *     found with the same ID
   * @see HelperMethods#getAnimalById(prerna.engine.impl.rdbms.RDBMSNativeEngine, String)
   * @see PixelDataType#MAP
   */
  @Override
  protected NounMetadata doExecute() {
    String animalId = this.keyValue.get(Constants.ANIMAL_ID);

    // Perform database lookup for the specified animal ID
    List<Map<String, Object>> animalData = HelperMethods.getAnimalById(database, animalId);

    // Validate that exactly one record was found
    if (animalData.isEmpty()) {
      throw new ProjectException(ErrorCode.NOT_FOUND, "Animal not found");
    }

    if (animalData.size() > 1) {
      throw new ProjectException(
          ErrorCode.INTERNAL_SERVER_ERROR, "Multiple animals found with that id");
    }

    // Extract the single animal record
    Map<String, Object> animal = animalData.get(0);

    return new NounMetadata(animal, PixelDataType.MAP);
  }
}
