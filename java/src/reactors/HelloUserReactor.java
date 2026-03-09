package reactors;

import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

// Example reactor that greets a user.
// Accepts an optional name parameter; defaults to the authenticated user's name.
public class HelloUserReactor extends AbstractProjectReactor {

  // Note: Has access to protected variables defined in AbstractProjectReactor

  private static final String NAME_KEY = "name";

  public HelloUserReactor() {

    // list of keys the reactor is expecting
    this.keysToGet = new String[] {NAME_KEY};

    // 1 for required keys, 0 for optional
    this.keyRequired = new int[] {0};
  }

  @Override
  protected NounMetadata doExecute() {

    // returns null if the argument is not found
    String name = this.keyValue.get(NAME_KEY);

    // if name is not provided, use the user's name
    name = (name == null) ? user.getPrimaryLoginToken().getName() : name;

    // grabbing user from AbstractProjectReactor
    String response = "Hello, " + name + "! Welcome to SEMOSS.";

    return new NounMetadata(response, PixelDataType.CONST_STRING);
  }
}
