package reactors.examples;

import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.ReactorKeysEnum;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.AbstractProjectReactor;

/**
 * Example reactor that demonstrates basic user greeting functionality within the project system.
 *
 * <p>This reactor serves as a simple example of how to extend {@link AbstractProjectReactor} to
 * create custom business logic. It generates personalized greeting messages by accepting an
 * optional name parameter or falling back to the current user's name from the session context.
 *
 * <p>The reactor demonstrates several key concepts:
 *
 * <ul>
 *   <li>Parameter handling with optional keys
 *   <li>Access to user session information through inherited protected variables
 *   <li>Simple string response generation
 *   <li>Proper use of {@link NounMetadata} for result packaging
 * </ul>
 *
 * <p>This example can be used as a template for creating more complex reactors that need to
 * interact with user data and generate dynamic responses based on input parameters.
 *
 * @author SEMOSS
 * @version 1.0
 * @since 1.0
 * @see AbstractProjectReactor
 * @see ReactorKeysEnum
 * @see NounMetadata
 */
public class HelloUserReactor extends AbstractProjectReactor {

  /**
   * Constructs a new HelloUserReactor with configuration for expected input parameters.
   *
   * <p>This constructor sets up the reactor to accept an optional "name" parameter. The reactor is
   * configured to work with or without this parameter, providing flexible greeting functionality.
   *
   * @see ReactorKeysEnum#NAME
   * @see AbstractProjectReactor#keysToGet
   * @see AbstractProjectReactor#keyRequired
   */
  public HelloUserReactor() {
    // List of keys the reactor is expecting
    this.keysToGet = new String[] {ReactorKeysEnum.NAME.getKey()};

    // 1 for required keys, 0 for optional (name is optional)
    this.keyRequired = new int[] {0};
  }

  /**
   * Executes the greeting logic and returns a personalized welcome message.
   *
   * <p>This method retrieves the name parameter from the input, or falls back to using the current
   * user's name if no name is provided. It then constructs a welcome message and returns it wrapped
   * in appropriate metadata.
   *
   * <p>The execution flow:
   *
   * <ol>
   *   <li>Attempts to retrieve the "name" parameter from input
   *   <li>Falls back to current user's name if parameter is not provided
   *   <li>Constructs a personalized greeting message
   *   <li>Returns the message as string metadata
   * </ol>
   *
   * @return {@link NounMetadata} containing the greeting message as a constant string
   * @see ReactorKeysEnum#NAME
   * @see AbstractProjectReactor#user
   * @see PixelDataType#CONST_STRING
   */
  @Override
  protected NounMetadata doExecute() {
    // Returns null if the argument is not found
    String name = this.keyValue.get(ReactorKeysEnum.NAME.getKey());

    // If name is not provided, use the user's name from the session
    name = (name == null) ? user.getPrimaryLoginToken().getName() : name;

    // Generate personalized greeting message
    String response = "Hello, " + name + "! Welcome to SEMOSS.";

    return new NounMetadata(response, PixelDataType.CONST_STRING);
  }
}
