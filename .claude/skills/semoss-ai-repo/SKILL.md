---
name: semoss-ai-repo
description: Use when submitting a SEMOSS app into the review/repository pipeline with the ai-repo CLI — logging in, registering an app (create-app), publishing a zipped version (publish), and checking workflow status (status, versions). Covers install/link, the command reference, what gets zipped, and credential storage. Do not use for iterating against a live instance (that's scripts/claude/semoss_asset_sync.py — see semoss-deploy) or for manual UI zip uploads.
---

# ai-repo CLI — Submit Tier

`ai-repo` is a TypeScript CLI for the AI Repository submit/review pipeline: login, app
registration, zip publishing, and status checks against the SEMOSS repository server.
This is the **Submit** deploy tier — distinct from the **Iterate** tier
(`semoss_asset_sync.py`), which updates an app's code against a running instance. Use
`ai-repo` to push a version into the review workflow.

## Setup (first time)

Requires Node 18+ and pnpm.

```bash
cd /path/to/ai-repo-cli
pnpm install
pnpm build              # compiles TypeScript to dist/
pnpm link --global      # makes `ai-repo` available everywhere
ai-repo --version       # verify
```

`pnpm link --global` symlinks the package root, so after code changes just `pnpm build` —
the global binary picks up the new `dist/`. Re-link only if you unlinked. To run without
building: `pnpm dev <command>`.

## Commands

### `login` / `logout`

```bash
ai-repo login --base-url <semoss-url>/Monolith --access-key XXX --secret-key YYY
ai-repo logout
```

### `create-app` — register metadata (no zip)

```bash
ai-repo create-app --name "<name>" --business-unit "<unit>" [--description "..."] [--tags "t1,t2"]
```

Returns a server-generated `appId`. Hand that to `publish`.

### `publish` — upload the current project as a new version

Build the project **first** — the CLI zips and uploads from the project root, it does not
run a build.

```bash
ai-repo publish [--app <app-id>] [--notes "..."] [--root <dir>] [--include <dirs>] [--dry-run]
```

- Default zipped dirs (any that exist): `client/`, `java/`, `portals/`, `py/`, `mcp/`.
- `node_modules/` and `.git/` are always excluded, even nested.
- `--include "semoss_config,scripts"` — add extra comma-separated paths.
- `--root <dir>` — override source dir (default: cwd).
- `--dry-run` — stage the zip and print its contents without uploading.

### `status` / `versions`

```bash
ai-repo status --app <app-id> [--version <n>]   # latest if --version omitted
ai-repo versions --app <app-id>
```

## Credential storage

Stored in the OS keychain via `keytar` when available; otherwise falls back to
`~/.ai-repo/credentials.json` (mode 0600). Overrides:

- `AI_REPO_REQUIRE_KEYCHAIN=true` — keychain only, no file fallback (fail fast).
- `AI_REPO_CONFIG_DIR` / `AI_REPO_CREDENTIALS_PATH` — relocate config/creds.

Windows: `keytar` needs native bindings; on locked-down hosts pre-provision it or set
`AI_REPO_REQUIRE_KEYCHAIN=true`.

## Reactor name overrides

The CLI targets these SEMOSS reactors by default — override in `~/.ai-repo/config.json`
if a deployment renames them: `RepositoryCreateApp`, `RepositoryCreateAppVersion`,
`RepositoryGetApp`, `RepositoryGetPublishStatus`, `RepositoryListApps`.
