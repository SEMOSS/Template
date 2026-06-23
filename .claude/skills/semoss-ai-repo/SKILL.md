---
name: semoss-ai-repo
description: Use when submitting a SEMOSS app into the review/repository pipeline with the ai-repo CLI — logging in, registering an app (create-app), publishing a zipped version (publish), and checking workflow status (status, versions). Covers the command set, publish gotchas (build first, what gets zipped, what's excluded), and where credentials are stored. Assumes the ai-repo binary is already installed. Do not use for iterating against a live instance (that's scripts/claude/semoss_asset_sync.py — see semoss-deploy) or for manual UI zip uploads.
---

# ai-repo CLI — Submit Tier

`ai-repo` is a CLI for the AI Repository submit/review pipeline: login, app registration,
zip publishing, and status checks against the SEMOSS repository server. This is the
**Submit** deploy tier — distinct from the **Iterate** tier (`semoss_asset_sync.py`),
which updates an app's code against a running instance. Use `ai-repo` to push a version
into the review workflow.

This skill assumes the `ai-repo` binary is already installed and on your `PATH`
(installing/building the CLI itself is out of scope — see the ai-repo project's own docs).
Verify with `ai-repo --version`.

## Commands

Run `ai-repo --help` or `ai-repo <command> --help` for current flags — don't trust a
copied flag list here, it drifts. The command set:

- `login` / `logout` — authenticate against a `<semoss-url>/Monolith` base URL with an
  access/secret key pair.
- `create-app` — register app metadata (name, business unit, etc.); returns a
  server-generated `appId` to hand to `publish`. No zip is uploaded.
- `publish` — zip the current project and upload it as a new version.
- `status` / `versions` — check the review-workflow status of a published version.

### `publish` gotchas

- **Build first.** The CLI zips and uploads from the project root — it does **not** run a
  build. Run `cd client && pnpm build` before publishing.
- **Default zipped dirs** (any that exist): `client/`, `java/`, `portals/`, `py/`, `mcp/`.
  Use the include flag to add paths like `semoss_config` or `scripts`.
- Always excluded, even nested: `node_modules/`, `.git/`, and secret/local files
  (`.env`, `.env.*`, `*.local`, `*.local.*`) — so your gitignored env config won't ship.
- Use the dry-run flag to stage the zip and print its contents without uploading.

## Credential storage

`ai-repo login` persists your secret key to `~/.ai-repo/credentials.json` (mode 0600), so
you only log in once. You don't manage this file by hand — `login`/`logout` handle it.
