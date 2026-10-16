package reactors.users;

import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import reactors.base.AbstractProjectReactor;
import util.AppException;
import util.ErrorCode;

// Returns the caller's app_user row. NOT_FOUND is an expected outcome the frontend branches on
// (it shows the no-access page), so this reactor must not require an active user itself.
public class GetAppUserReactor extends AbstractProjectReactor {

  @Override
  protected boolean requireActiveAppUser() {
    return false;
  }

  @Override
  protected NounMetadata doExecute() {
    if (appUser == null) {
      throw new AppException(
          ErrorCode.NOT_FOUND, "No user found for '" + getCurrentUsername() + "'");
    }
    return new NounMetadata(appUser, PixelDataType.MAP);
  }

  @Override
  public String getReactorDescription() {
    return "Get the current user's app profile.";
  }

  @Override
  public String getDescriptionForKey(String key) {
    return null;
  }
}
