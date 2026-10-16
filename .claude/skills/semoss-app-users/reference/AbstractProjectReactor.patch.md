Changes to `java/src/reactors/base/AbstractProjectReactor.java` (the server is the real access
boundary; the UI gate is only convenience):

```java
// field
protected Map<String, Object> appUser; // the caller's app_user row, or null

// at the end of preExecute(), before organizeKeys():
if (database != null) {
  appUser = new AppUserRepository(database).findByUserId(getCurrentUsername());
}
boolean isActive = appUser != null && !Boolean.TRUE.equals(appUser.get("isInactive"));
if (requireActiveAppUser() && !isActive) {
  throw new AppException(
      ErrorCode.PERMISSION_DENIED, "No active user found for '" + getCurrentUsername() + "'");
}

// Override to return false only for a reactor that must work without access
// (GetAppUserReactor, whose job is to report that outcome).
protected boolean requireActiveAppUser() {
  return true;
}
```

Import `database.users.AppUserRepository`.
