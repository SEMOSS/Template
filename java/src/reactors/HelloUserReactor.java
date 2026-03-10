package reactors;

import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

// Example reactor: returns a greeting for a given name.
//
// Called from the frontend as:  HelloUser(name=["Boston"])
// Note: SEMOSS strips the "Reactor" suffix, so HelloUserReactor becomes HelloUser().
//
// This is a minimal example showing:
//   - How to define parameters (keysToGet / keyRequired)
//   - How to read parameter values (this.keyValue.get(...))
//   - How to access the authenticated user (from AbstractProjectReactor)
//   - How to return a result as NounMetadata
//
// Use this as a starting point for your own reactors.
public class HelloUserReactor extends AbstractProjectReactor {

  // Protected variables from AbstractProjectReactor are available here:
  //   this.user, this.projectId, this.projectProperties

  private static final String NAME_KEY = "name";

  public HelloUserReactor() {
    // Define the parameters this reactor accepts.
    // These map to the Pixel command: HelloUser(name=["value"])
    this.keysToGet = new String[] {NAME_KEY};

    // 1 = required, 0 = optional. Must match keysToGet order.
    this.keyRequired = new int[] {0};
  }

  @Override
  protected NounMetadata doExecute() {
    // Read the "name" parameter. Returns null if not provided.
    String name = this.keyValue.get(NAME_KEY);

    // Fall back to the authenticated user's name if no parameter was given
    name = (name == null) ? user.getPrimaryLoginToken().getName() : name;

    String response = "Hello, " + name + "! Welcome to SEMOSS.";

    // Return a string result. For structured data, use PixelDataType.MAP with a HashMap.
    return new NounMetadata(response, PixelDataType.CONST_STRING);
  }
}
