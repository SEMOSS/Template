# Scripts

The `claude/` directory contains `semoss_asset_sync.py`, the deploy script used by Claude Code to sync local build output to SEMOSS.

## Setup

The script reads credentials from `.mcp.json` (via `${env:SEMOSS_ACCESS_KEY}` references) and project metadata from `semoss_config/config.json`.

The SEMOSS Python SDK must be installed:

```bash
pip install ai-server-sdk
```

## Commands

```bash
# Upload a single file
python scripts/claude/semoss_asset_sync.py upload portals/index.html

# Bulk-upload an entire directory (publish once at the end)
python scripts/claude/semoss_asset_sync.py bulk-upload portals

# Delete remote assets (e.g. stale hashed bundles before a redeploy)
python scripts/claude/semoss_asset_sync.py delete portals/assets --yes

# Publish the project without uploading
python scripts/claude/semoss_asset_sync.py publish

# Download a remote folder to the local workspace
python scripts/claude/semoss_asset_sync.py sync-from-remote portals
```

## Typical Deploy Workflow

```bash
cd client && pnpm run build && cd ..
python scripts/claude/semoss_asset_sync.py delete portals/assets --yes
python scripts/claude/semoss_asset_sync.py bulk-upload portals
```

Delete `portals/assets` first because Vite emits new content hashes on every build — skipping the delete leaves stale files on the remote.
