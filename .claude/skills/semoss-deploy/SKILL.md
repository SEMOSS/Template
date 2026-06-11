---
name: semoss-deploy
description: Use when publishing, uploading, or updating a SEMOSS app — choosing among the three deploy tiers (manual UI zip, the semoss_asset_sync.py iterate flow, or the ai-repo submit pipeline), switching between named environments (local/preprod/prod), writing client/.env.local before a build, or handling SSL/proxy errors during upload. Do not use for the ai-repo CLI command reference specifically (see semoss-ai-repo) or for editing tool manifests (see semoss-mcp-manifest).
---

# Deploying a SEMOSS App

Three deploy tiers, picked by capability. The agent owns environment switching — the
user just names the target (e.g. "deploy to preprod").

| Tier | Mechanism | When | Requires |
|------|-----------|------|----------|
| **Universal** | Manual UI zip drag-and-drop | Always works, no tooling | `zip` (or Windows `tar.exe`) |
| **Iterate** | `scripts/claude/semoss_asset_sync.py` | Updating an app against a configured instance | Python 3.10+ + creds |
| **Submit** | `ai-repo` CLI | Submitting an app to the review pipeline | the CLI + login (see `semoss-ai-repo`) |

The deploy lifecycle is always: **create the app once → write `client/.env.local` →
build → upload (auto-compiles Java + auto-publishes).**

## Multi-environment config

You will often target several backends. Config lives in `semoss_config/` (gitignored;
copy from the `.example` files):

- **`environments.json`** — named envs under `envs.<name>`, each with `base_url`,
  `api_module_url`, `web_module_url`, `app_id`. Plus top-level `model_id`, `database_id`.
- **`credentials.env`** — one access/secret pair per env, prefixed by the **uppercased**
  env name: `LOCAL_ACCESS_KEY`/`LOCAL_SECRET_KEY`, `PREPROD_*`, `PROD_*`.

`app_id` differs per environment for the same logical app — it's set after the app is
created on that instance. "app" and "project" are synonyms on SEMOSS.

### Deriving instance URLs

Set `base_url` to the hostname. For `api_module_url`/`web_module_url`, include any path
prefix that sits before `/Monolith` or `/SemossWeb`:

| Instance URL | `base_url` | `api_module_url` | `web_module_url` |
|---|---|---|---|
| `https://host.com/SemossWeb/...` | `https://host.com/` | `/Monolith` | `/SemossWeb` |
| `https://host.com/prod/SemossWeb/...` | `https://host.com/` | `/prod/Monolith` | `/prod/SemossWeb` |

## Before every build: write `client/.env.local`

`vite.config.ts` bakes three env vars into the bundle at build time. Write them for the
target env before building:

```
APP=<envs.<name>.app_id>
ENDPOINT=<envs.<name>.base_url>
MODULE=<envs.<name>.api_module_url>
```

`client/.env` is a committed dummy placeholder — never edit it. `.env.local` overrides
it and is gitignored.

## Tier 2 — Iterate (semoss_asset_sync.py)

The default loop while developing against a live instance. One command uploads all asset
directories and auto-publishes:

```bash
cd client && pnpm build && cd ..
python scripts/claude/semoss_asset_sync.py --env <name> bulk-upload portals py java mcp
```

- `--env <name>` selects the entry in `environments.json` + `credentials.env`.
- `bulk-upload` browses-and-deletes existing files at the same remote paths, uploads,
  runs `CompileAppReactors` (so `.java` changes recompile), then `PublishProject`.
- Passing dirs the app doesn't use is harmless (empty = no-op).
- **First deploy:** add `--no-delete-existing` (nothing to delete yet, faster).
- **Skip Java compile:** `--no-compile` (frontend-only change).
- **Self-signed certs (preprod):** `--no-verify-ssl`.

Vite emits new content hashes every build, so stale bundles can orphan. To nuke a remote
subtree before re-uploading:

```bash
python scripts/claude/semoss_asset_sync.py --env <name> delete portals/assets --yes
```

Other commands: `upload <file>` (single file), `publish` (publish without uploading),
`sync-from-remote <folder>` (download remote → local).

## Tier 1 — Universal (manual UI zip)

When Python isn't available. The editor **only accepts zip files**, so bundle first:

```bash
zip -r bundle.zip portals py java mcp
```

Then open the editor at
`<base_url><web_module_url>/packages/client/dist/#/app/<app_id>/edit`, drag the zip in,
**check the "unzip" checkbox**, and click **"Compile and publish the app."**

**Windows zip gotchas:**
- The Bash tool's Git Bash ships `zip.exe`, so `zip -r` works there too.
- **Don't** use `tar -a -c -f bundle.zip` — Git Bash's GNU tar writes a tar with a
  `.zip` extension; SEMOSS rejects it ("zip END header not found"). If you must use tar,
  call the native BSD one by absolute path: `C:\Windows\System32\tar.exe -a -c -f ...`.
- **Don't** use PowerShell `Compress-Archive` — backslash path separators break the
  server-side unzip ("Unable to unzip file. X not a directory").

## Tier 3 — Submit (ai-repo CLI)

For submitting an app into the review pipeline. Build first, then publish a version. Full
command reference is in the `semoss-ai-repo` skill.

## SSL / corporate proxy errors

Managed laptops (Deloitte/FDA/DHA) often sit behind a MITM proxy with a corporate CA that
Node/Python don't trust. Preprod instances may also use self-signed certs.

- **Node** (`pnpm install`, `corepack enable`): `export NODE_TLS_REJECT_UNAUTHORIZED=0`.
  Don't go hunting for the corp CA path — this is the practical fix.
- **Python sync script:** pass `--no-verify-ssl` (already wired).
- **MCP servers** (`.mcp.json`): set `"NODE_TLS_REJECT_UNAUTHORIZED": "0"` in each
  server's `env` field — `.mcp.json.example` already includes it. Symptom of the proxy
  issue here is usually "MCP tools just don't show up" rather than a loud error.

Local-only commands (`pnpm build`, `pnpm dev`, `pnpm fix`) make no outbound calls — no
flag needed.

## Creating the app (once per environment)

Apps are created via the `Semoss_project_manager.create_project` MCP tool — **only when
the user explicitly asks**, never as a default. Save the returned `project_id` into
`environments.json` as that env's `app_id` *before* running the sync script, or files go
to the wrong project. Project names must be unique per instance. See the
`semoss-platform-backend` skill for the project-manager MCP details.
