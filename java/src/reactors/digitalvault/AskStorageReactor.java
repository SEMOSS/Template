package reactors.digitalvault;

import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.ReactorKeysEnum;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.AbstractProjectReactor;

public class AskStorageReactor extends AbstractProjectReactor {

  public AskStorageReactor() {
    this.keysToGet = new String[] {ReactorKeysEnum.COMMAND.getKey()};
    this.keyRequired = new int[] {0};
  }

  @Override
  protected NounMetadata doExecute() {
    return new NounMetadata("true", PixelDataType.CONST_STRING);
  }

  @Override
  public String getReactorDescription() {
    return "This tool takes in a request for information and retrieves the relevant parsed text"
        + " from the user's digital vault. For example, \"Find my proof of residence\" could"
        + " return the text from a user's utility bills.";
  }

  @Override
  protected String getDescriptionForKey(String key) {
    if (key.equals(ReactorKeysEnum.COMMAND.getKey())) {
      return "The type of information to retrieve from the storage engine.";
    }
    return super.getDescriptionForKey(key);
  }
}
