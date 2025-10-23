package util;

import domain.base.ErrorCode;
import domain.base.ProjectException;
import domain.examples.database.AnimalData;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import prerna.auth.User;
import prerna.engine.impl.rdbms.RDBMSNativeEngine;
import prerna.query.querystruct.SelectQueryStruct;
import prerna.query.querystruct.filters.SimpleQueryFilter;
import prerna.query.querystruct.selectors.QueryColumnSelector;
import prerna.util.ConnectionUtils;
import prerna.util.QueryExecutionUtility;

/**
 * Utility class that provides common helper methods and utility functions used throughout the
 * project for various operations and data processing tasks.
 *
 * <p>This class serves as a repository for reusable utility methods that don't belong to a specific
 * domain class but are needed across multiple components of the application. Examples include
 * string manipulation, data conversion, validation, and other general-purpose operations.
 *
 * <p>As a utility class, this class should not be instantiated and all methods should be static and
 * public for easy access throughout the project.
 *
 * @see {@link Constants} for static configuration values that may be manipulated or referenced by
 *     future helper methods.
 * @see {@link ProjectProperties} for dynamic property values that helper methods may consume.
 */
public class HelperMethods {

  /**
   * Extracts the unique user identifier from a User object.
   *
   * <p>This utility method provides a standardized way to retrieve the user ID from a User instance
   * by accessing the primary login token. This is commonly used throughout the system for user
   * identification, logging, and access control purposes.
   *
   * @param user the User object from which to extract the ID
   * @return the unique identifier string for the specified user
   * @see User#getPrimaryLoginToken()
   */
  public static String getUserId(User user) {
    return user.getPrimaryLoginToken().getId();
  }

  /**
   * Retrieves all animal records from the database.
   *
   * <p>This method constructs and executes a query to fetch all animal records from the ANIMAL
   * table, returning the results in a standardized map format. Each map represents a single animal
   * record with keys corresponding to the database column names.
   *
   * <p>The returned data includes:
   *
   * <ul>
   *   <li>animal_id - unique identifier for the animal
   *   <li>animal_name - the given name of the animal
   *   <li>animal_type - the species or type classification
   *   <li>date_of_birth - the birth date of the animal
   * </ul>
   *
   * @param database the database engine instance to use for the query
   * @return a list of maps, each representing an animal record
   * @see SelectQueryStruct
   * @see QueryColumnSelector
   * @see QueryExecutionUtility#flushRsToMap(RDBMSNativeEngine, SelectQueryStruct)
   */
  public static List<Map<String, Object>> getAnimals(RDBMSNativeEngine database) {
    SelectQueryStruct qs = new SelectQueryStruct();
    qs.addSelector(new QueryColumnSelector("ANIMAL__ANIMAL_ID", "animal_id"));
    qs.addSelector(new QueryColumnSelector("ANIMAL__ANIMAL_NAME", "animal_name"));
    qs.addSelector(new QueryColumnSelector("ANIMAL__ANIMAL_TYPE", "animal_type"));
    qs.addSelector(new QueryColumnSelector("ANIMAL__DATE_OF_BIRTH", "date_of_birth"));

    return QueryExecutionUtility.flushRsToMap(database, qs);
  }

  /**
   * Retrieves a specific animal record by its unique identifier.
   *
   * <p>This method constructs and executes a filtered query to fetch a single animal record based
   * on the provided animal ID. The query includes all animal fields and applies a filter to match
   * the exact animal ID specified.
   *
   * <p>The method returns a list to maintain consistency with the query execution utility, but
   * under normal circumstances should return either zero or one record. Multiple records with the
   * same ID would indicate a data integrity issue.
   *
   * @param database the database engine instance to use for the query
   * @param animalId the unique identifier of the animal to retrieve
   * @return a list containing zero or one animal record maps matching the specified ID
   * @see SelectQueryStruct
   * @see SimpleQueryFilter#makeColToValFilter(String, String, Object)
   * @see QueryExecutionUtility#flushRsToMap(RDBMSNativeEngine, SelectQueryStruct)
   */
  public static List<Map<String, Object>> getAnimalById(
      RDBMSNativeEngine database, String animalId) {
    SelectQueryStruct qs = new SelectQueryStruct();
    qs.addSelector(new QueryColumnSelector("ANIMAL__ANIMAL_ID", "animal_id"));
    qs.addSelector(new QueryColumnSelector("ANIMAL__ANIMAL_NAME", "animal_name"));
    qs.addSelector(new QueryColumnSelector("ANIMAL__ANIMAL_TYPE", "animal_type"));
    qs.addSelector(new QueryColumnSelector("ANIMAL__DATE_OF_BIRTH", "date_of_birth"));
    qs.addExplicitFilter(SimpleQueryFilter.makeColToValFilter("ANIMAL__ANIMAL_ID", "==", animalId));

    return QueryExecutionUtility.flushRsToMap(database, qs);
  }

  /**
   * Adds a new animal record to the database.
   *
   * <p>This method performs a database insertion operation to create a new animal record using the
   * provided {@link AnimalData} object. It uses prepared statements for security and includes
   * comprehensive error handling and resource management.
   *
   * <p>The insertion process:
   *
   * <ol>
   *   <li>Obtains a database connection from the engine
   *   <li>Creates a prepared statement for the INSERT operation
   *   <li>Binds all animal data parameters to the statement
   *   <li>Executes the insertion
   *   <li>Properly closes all resources regardless of success or failure
   * </ol>
   *
   * @param database the database engine instance to use for the insertion
   * @param animalData the animal data object containing all information to be inserted
   * @throws ProjectException with {@link ErrorCode#INTERNAL_SERVER_ERROR} if the insertion fails
   * @see AnimalData
   * @see PreparedStatement
   * @see ConnectionUtils#closeAllConnectionsIfPooling
   */
  public static void addAnimal(RDBMSNativeEngine database, AnimalData animalData) {
    Connection con = null;
    try {
      con = database.getConnection();
      try (PreparedStatement ps =
          con.prepareStatement(
              "INSERT INTO ANIMAL (ANIMAL_ID, ANIMAL_NAME, ANIMAL_TYPE, DATE_OF_BIRTH)\n"
                  + "VALUES (?, ?, ?, ?);")) {
        int parameterIndex = 1;
        ps.setString(parameterIndex++, animalData.getAnimalId());
        ps.setString(parameterIndex++, animalData.getAnimalName());
        ps.setString(parameterIndex++, animalData.getAnimalType());
        ps.setObject(parameterIndex++, animalData.getDateOfBirth().getFormattedDate());
        ps.execute();
      } catch (SQLException e) {
        throw new ProjectException(ErrorCode.INTERNAL_SERVER_ERROR);
      }
    } catch (Exception e) {
      throw new ProjectException(ErrorCode.INTERNAL_SERVER_ERROR, "Error adding animal");
    } finally {
      ConnectionUtils.closeAllConnectionsIfPooling(database, con, null, null);
    }
  }

  /**
   * Deletes an animal record from the database by its unique identifier.
   *
   * <p>This method performs a database deletion operation to remove an animal record matching the
   * specified animal ID. It uses prepared statements for security and includes comprehensive error
   * handling and resource management.
   *
   * <p>The deletion process:
   *
   * <ol>
   *   <li>Obtains a database connection from the engine
   *   <li>Creates a prepared statement for the DELETE operation
   *   <li>Binds the animal ID parameter to the statement
   *   <li>Executes the deletion
   *   <li>Properly closes all resources regardless of success or failure
   * </ol>
   *
   * <p>Note: This method does not verify that the animal exists before attempting deletion. Callers
   * should perform existence checks if needed before calling this method.
   *
   * @param database the database engine instance to use for the deletion
   * @param animalId the unique identifier of the animal record to delete
   * @throws ProjectException with {@link ErrorCode#INTERNAL_SERVER_ERROR} if the deletion fails
   * @see PreparedStatement
   * @see ConnectionUtils#closeAllConnectionsIfPooling
   */
  public static void deleteAnimal(RDBMSNativeEngine database, String animalId) {
    Connection con = null;
    try {
      con = database.getConnection();
      try (PreparedStatement ps = con.prepareStatement("DELETE FROM ANIMAL WHERE ANIMAL_ID = ?")) {
        int parameterIndex = 1;
        ps.setString(parameterIndex++, animalId);
        ps.executeUpdate();
      } catch (SQLException e) {
        throw new ProjectException(ErrorCode.INTERNAL_SERVER_ERROR);
      }
    } catch (Exception e) {
      throw new ProjectException(ErrorCode.INTERNAL_SERVER_ERROR, "Error deleting animal");
    } finally {
      ConnectionUtils.closeAllConnectionsIfPooling(database, con, null, null);
    }
  }
}
