# Scripts

`semoss_asset_sync.py` is the deploy script coding agents use to sync local
build output to a SEMOSS instance over REST. It is the **iterate** tier of the deploy
flow — for full deploy guidance (manual UI zip, asset sync, ai-repo CLI) see the
`semoss-deploy` skill under `.agents/skills/`.

## Setup

The script reads endpoint and app config from `semoss_config/environments.json` and
credentials from `semoss_config/credentials.env`. Copy each from its `.example` file
and fill in your values before running.

The SEMOSS Python SDK must be installed, version **0.0.30 or newer**:

```bash
pip install -U "ai-server-sdk>=0.0.30"
```

Older SDKs (e.g. 0.0.20) lack the CSRF token handshake and fail with a 403 at the
auth step against CSRF-protected instances (common locally). 0.0.30+ fixes this.

## Commands

The usual deploy is one command (writes `client/.env.local`, points `java/project.properties`
at the env's `database_id`, builds, uploads, removes orphaned remote files, compiles, publishes,
then restores `java/project.properties`):

```bash
python scripts/semoss_asset_sync.py --env local deploy
```

`deploy` flags: `--no-build`, `--no-clean`, `--no-compile` (frontend-only change), `--no-publish`,
`--no-delete-existing` (first deploy to an empty app). Read the "Compiling reactors" output; an
error there means the backend on the instance is stale even though the upload succeeded.

`configure` does the first two steps only and leaves `java/project.properties` set, for `pnpm dev`:

```bash
python scripts/semoss_asset_sync.py --env local configure
```

The lower-level commands:

Every command takes `--env <name>` to target a named environment from
`environments.json` (e.g. `local`, `preprod`, `prod`). Credentials are resolved from
`credentials.env` by the uppercased env name (`LOCAL_ACCESS_KEY`, `PROD_ACCESS_KEY`, …).

```bash
# Upload a single file
python scripts/semoss_asset_sync.py --env local upload portals/index.html

# Bulk-upload directories (publishes once at the end). --clean also deletes remote files under
# java/src and portals/assets that aren't in the upload (bulk-upload alone never deletes them)
python scripts/semoss_asset_sync.py --env local bulk-upload portals java mcp --clean

# Delete remote assets (e.g. stale hashed bundles before a redeploy)
python scripts/semoss_asset_sync.py --env local delete portals/assets --yes

# Publish the project without uploading
python scripts/semoss_asset_sync.py --env local publish

# Download a remote folder to the local workspace
python scripts/semoss_asset_sync.py --env local sync-from-remote portals
```

For self-signed certs (common on preprod), add `--no-verify-ssl`.
