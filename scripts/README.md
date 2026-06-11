# Scripts

`claude/semoss_asset_sync.py` is the deploy script Claude Code uses to sync local
build output to a SEMOSS instance over REST. It is the **iterate** tier of the deploy
flow — for full deploy guidance (manual UI zip, asset sync, ai-repo CLI) see the
`semoss-deploy` skill under `.claude/skills/`.

## Setup

The script reads endpoint and app config from `semoss_config/environments.json` and
credentials from `semoss_config/credentials.env`. Copy each from its `.example` file
and fill in your values before running.

The SEMOSS Python SDK must be installed:

```bash
pip install ai-server-sdk
```

## Commands

Every command takes `--env <name>` to target a named environment from
`environments.json` (e.g. `local`, `preprod`, `prod`). Credentials are resolved from
`credentials.env` by the uppercased env name (`LOCAL_ACCESS_KEY`, `PROD_ACCESS_KEY`, …).

```bash
# Upload a single file
python scripts/claude/semoss_asset_sync.py --env local upload portals/index.html

# Bulk-upload directories (publishes once at the end)
python scripts/claude/semoss_asset_sync.py --env local bulk-upload portals py java mcp

# Delete remote assets (e.g. stale hashed bundles before a redeploy)
python scripts/claude/semoss_asset_sync.py --env local delete portals/assets --yes

# Publish the project without uploading
python scripts/claude/semoss_asset_sync.py --env local publish

# Download a remote folder to the local workspace
python scripts/claude/semoss_asset_sync.py --env local sync-from-remote portals
```

For self-signed certs (common on preprod), add `--no-verify-ssl`.

## Typical deploy workflow

```bash
cd client && pnpm build && cd ..
python scripts/claude/semoss_asset_sync.py --env local delete portals/assets --yes
python scripts/claude/semoss_asset_sync.py --env local bulk-upload portals py java mcp
```

Delete `portals/assets` first because Vite emits new content hashes on every build —
skipping the delete leaves stale bundles on the remote.
