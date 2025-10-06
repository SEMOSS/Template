package reactors.examples.database;

import java.util.List;
import java.util.Map;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.AbstractProjectReactor;
import util.HelperMethods;

/**
 * Reactor responsible for retrieving all animal records from the database system.
 *
 * <p>This reactor provides read-only access to the complete collection of animal data stored in the
 * database. It requires no input parameters and returns all available animal records in a
 * structured format suitable for display, processing, or API responses.
 *
 * <p>The reactor serves as a simple data retrieval interface that abstracts the underlying database
 * query complexity through the utility layer. It ensures consistent data formatting and error
 * handling while providing efficient access to the complete animal dataset.
 *
 * <p>Key functionality includes:
 *
 * <ul>
 *   <li>Retrieval of all animal records without filtering
 *   <li>Consistent data formatting through utility methods
 *   <li>Proper result packaging for various consumption patterns
 *   <li>No required input parameters for simple operation
 * </ul>
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
 * @see AbstractProjectReactor
 * @see HelperMethods#getAnimals(prerna.engine.impl.rdbms.RDBMSNativeEngine)
 */
public class GetAnimalsReactor extends AbstractProjectReactor {

  /**
   * Executes the animal retrieval process and returns all available animal records.
   *
   * <p>This method delegates to the utility layer to perform the database query and retrieve all
   * animal records. The results are returned as a list of maps, where each map represents a single
   * animal record with standardized key-value pairs.
   *
   * <p>The execution flow:
   *
   * <ol>
   *   <li>Delegates to {@link HelperMethods#getAnimals} for database query execution
   *   <li>Receives a list of animal records formatted as maps
   *   <li>Packages the results in appropriate metadata for return
   * </ol>
   *
   * <p>Each animal record in the returned list contains standardized fields such as animal_id,
   * animal_name, animal_type, and date_of_birth, making the data suitable for various consumption
   * patterns including API responses and UI display.
   *
   * @return {@link NounMetadata} containing a vector of maps, where each map represents an animal
   *     record
   * @see HelperMethods#getAnimals(prerna.engine.impl.rdbms.RDBMSNativeEngine)
   * @see PixelDataType#VECTOR
   */
  @Override
  protected NounMetadata doExecute() {
    // Retrieve all animal records from the database
    List<Map<String, Object>> animals = HelperMethods.getAnimals(database);

    return new NounMetadata(animals, PixelDataType.VECTOR);
  }
}
