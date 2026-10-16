---
name: semoss-app-users
description: Use when only some SEMOSS users should be allowed into the app - an app-level user table (app_user), a server-side access check in the base reactor, and a "no access" screen in the UI. Ships reference files (SQL, repository, reactor, base-reactor patch, AppUserGate). Not needed when any logged-in SEMOSS user may use the app (the default); use SEMOSS's own sharing/permissions for coarse access.
---

# App-level users (access gate)

Logging in proves someone is a SEMOSS user, not that they may use *this* app. This adds an
`app_user` table, a server-side check on every reactor, and a no-access screen. The **server
check is the real boundary**; the UI gate is convenience.

Files in `reference/` (copy, adapt names):

| File | Goes to |
|---|---|
| `app_user.sql` | Your app's schema script (then **Update schema**) |
| `AppUserRepository.java` | `java/src/database/users/` |
| `AbstractProjectReactor.patch.md` | edit `java/src/reactors/base/AbstractProjectReactor.java` as described |
| `GetAppUserReactor.java` | `java/src/reactors/users/` |
| `AppUserGate.tsx` | `client/src/components/` (export from the barrel) |

## Steps

1. Add the table and seed yourself (`user_id` = your SEMOSS username). Apply the schema change, then
   **Update schema** in the database editor.
2. Add the repository, patch the base reactor, add `GetAppUserReactor`. Every other reactor now
   returns `PERMISSION_DENIED` for a user with no active `app_user` row; only
   `GetAppUserReactor` overrides `requireActiveAppUser()` to `false`.
3. In `AppLayout.tsx`, wrap the shell's contents in `<AppUserGate>` so a no-access user sees the
   message instead of the sidebar and nav (put the gate inside `AuthorizedLayout`, outside
   `MainNavigation` if you want to hide the top bar too).
4. Optional admin screens: build an `app_user` management page
   (a paged list, an add/update reactor with `INVALID_INPUT` for duplicate ids via SQLState
   23505). Don't let an admin deactivate their own account.
5. Deploy, and read the compile output.

## Gotchas

- `getCurrentUsername()` falls back to name/email for SSO logins whose username is null; the
  `user_id` you seed must match what it returns for that login.
- Reactors that run **before** the user exists (the bootstrap/first-admin case) need
  `requireActiveAppUser()` overridden. Don't ship a "grant me access" button or reactor: it
  defeats the gate.
- Seed data in committed SQL files is committed: don't put real people's emails in a template-derived repo
  you share.
