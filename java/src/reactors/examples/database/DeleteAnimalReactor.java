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
 * Reactor responsible for removing animal records from the database system.
 *
 * <p>This reactor provides secure deletion functionality for animal records by requiring a specific
 * animal ID and performing validation to ensure the target record exists before attempting
 * deletion. It implements a defensive approach by verifying record existence prior to deletion to
 * provide meaningful error messages and prevent unnecessary database operations.
 *
 * <p>The reactor follows a two-phase approach: first verifying that the animal exists, then
 * performing the actual deletion. This ensures data integrity and provides clear feedback when
 * attempting to delete non-existent records.
 *
 * <p>Key functionality includes:
 *
 * <ul>
 *   <li>Pre-deletion validation to confirm record existence
 *   <li>Secure deletion of specified animal records
 *   <li>Proper error handling for missing records
 *   <li>Success confirmation upon successful deletion
 * </ul>
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
 * @see AbstractProjectReactor
 * @see HelperMethods#deleteAnimal(prerna.engine.impl.rdbms.RDBMSNativeEngine, String)
 * @see HelperMethods#getAnimalById(prerna.engine.impl.rdbms.RDBMSNativeEngine, String)
 * @see Constants#ANIMAL_ID
 */
public class DeleteAnimalReactor extends AbstractProjectReactor {

  /**
   * Constructs a new DeleteAnimalReactor with configuration for the required animal ID parameter.
   *
   * <p>This constructor sets up the reactor to expect a single mandatory parameter: the animal ID
   * of the record to be deleted. The animal ID is required to ensure precise targeting of the
   * deletion operation and maintain data integrity.
   *
   * @see Constants#ANIMAL_ID
   * @see AbstractProjectReactor#keysToGet
   * @see AbstractProjectReactor#keyRequired
   */
  public DeleteAnimalReactor() {
    this.keysToGet = new String[] {Constants.ANIMAL_ID};
    this.keyRequired = new int[] {1};
  }

  /**
   * Executes the animal deletion process with pre-validation and error handling.
   *
   * <p>This method implements a defensive deletion approach by first verifying that the target
   * animal record exists before attempting the deletion operation. This ensures proper error
   * handling and prevents database operations on non-existent records.
   *
   * <p>The execution flow:
   *
   * <ol>
   *   <li>Retrieves the animal ID from the input parameters
   *   <li>Performs a lookup to verify the animal record exists
   *   <li>Validates that at least one matching record is found
   *   <li>Delegates to {@link HelperMethods#deleteAnimal} for the actual deletion
   *   <li>Returns a success indicator upon completion
   * </ol>
   *
   * <p>The method ensures data integrity by validating record existence before deletion, providing
   * clear error messages for missing records, and confirming successful completion.
   *
   * @return {@link NounMetadata} containing a boolean true value indicating successful deletion
   * @throws ProjectException with {@link ErrorCode#NOT_FOUND} if the specified animal ID does not
   *     exist
   * @see HelperMethods#getAnimalById(prerna.engine.impl.rdbms.RDBMSNativeEngine, String)
   * @see HelperMethods#deleteAnimal(prerna.engine.impl.rdbms.RDBMSNativeEngine, String)
   * @see PixelDataType#BOOLEAN
   */
  @Override
  protected NounMetadata doExecute() {
    String animalId = this.keyValue.get(Constants.ANIMAL_ID);

    // Verify that the animal exists before attempting deletion
    List<Map<String, Object>> animals = HelperMethods.getAnimalById(database, animalId);
    if (animals.isEmpty()) {
      throw new ProjectException(ErrorCode.NOT_FOUND, "Animal not found");
    }

    // Perform the deletion operation
    HelperMethods.deleteAnimal(database, animalId);

    return new NounMetadata(true, PixelDataType.BOOLEAN);
  }
}
