## Getting Started

1. **Create an app** in the SEMOSS UI → App page → "Create New App" → choose pro-code. Note the app ID from the URL.

2. **Clone this template** into your app's `assets` folder:
   ```
   cd workspace/Semoss/project/[YourApp]_[app-id]/app_root/version/
   mv assets old-assets
   git clone <repo-url> assets
   ```
   
# SEMOSS Vibe Engineering Setup & Sync Guide

This workspace contains the local assets for a SEMOSS project (project ID stored in [semoss_config/config.json](semoss_config/config.json)). The "Vibe Engineering" setup described below prepares your environment, keeps credentials in sync, and pushes assets back to SEMOSS. All host-specific values (`base_url`, `api_module_url`, `web_module_url`) live in `semoss_config/config.json` so the guide stays environment agnostic.



## Prerequisites

1. **Python 3.13 (Windows Store `py -3.13`)**  
   The sync script relies on the system-wide 3.13 interpreter. Other versions may not have the SEMOSS SDK available.
2. **SEMOSS Python SDK (`ai_server`)**  
   Install the wheel published on PyPI as [`ai-server-sdk`](https://pypi.org/project/ai-server-sdk/) so `from ai_server import ServerClient` succeeds in `scripts/semoss_asset_sync.py`. Run `py -3.13 -m pip install ai-server-sdk` (or upgrade with `--upgrade`) to ensure the package lands in the Python 3.13 site-packages that the sync script uses.
3. **Node.js + `npx`**  
   Required only to interact with remote MCP tools (already configured through `.vscode/mcp.json`).
4. **Access + Secret Keys for SEMOSS**  
   These are the bearer credentials inserted into `.vscode/mcp.json` and used by the sync utilities. Treat them as secrets. Generate or rotate tokens through the platform's profile settings (Settings ▸ My Profile) available under your `base_url` instance.

> `requests` is optional. If it is unavailable, the sync script automatically falls back to Python's standard library networking stack.

## Configuration Files

| File | Purpose |
| --- | --- |
| `.vscode/mcp.json` | Wires VS Code MCP to the SEMOSS remote tools. Update the `Authorization:Bearer...` header whenever keys rotate. |
| `semoss_config/config.json` | Stores project metadata (project ID, `base_url`, `api_module_url`, `web_module_url`, creation timestamp). Keep this committed so collaborators share the same target project. |
| `gcai.config` | Runtime configuration consumed by `scripts/semoss_asset_sync.py`. At minimum it must contain `PROJECT_ID` and the fully qualified `BASE_URL` (e.g., `<base_url><api_module_url>`). |

## Workflow

1. **Refresh credentials (when needed)**
   - Edit `.vscode/mcp.json` and replace the bearer token entries for all three servers (`Semoss_Platform_Instructions`, `Semoss_project_manager`, `Semoss_database_helper`).
   - Reopen VS Code or run `Developer: Reload Window` so MCP picks up the change.

2. **Ensure local config matches the remote project**
   - Confirm `semoss_config/config.json` has the correct `project_id` and URLs.
   - Mirror those values in `gcai.config` (especially `PROJECT_ID`).

3. **Upload assets to SEMOSS**
   - Run the sync script with the Python launcher to guarantee the 3.13 interpreter:  
     `py -3.13 scripts/semoss_asset_sync.py upload <path-to-local-file>`
   - The script will:
     1. Prompt before deleting any existing remote file.
     2. Back up the remote asset locally under `temp/semoss_backups/`.
     3. Upload the new file via the SEMOSS SDK.
     4. Publish the project so the change is visible.
   - Example (already used for the config file):  
     `py -3.13 scripts/semoss_asset_sync.py upload semoss_config/config.json`

4. **Download from SEMOSS (optional)**
   - Use the `sync-from-remote` command to pull portal assets to your workspace:  
     `py -3.13 scripts/semoss_asset_sync.py sync-from-remote version/assets/portals --overwrite`

5. **Portal URL**
   - Once assets are in place, the app is served via `<base_url><web_module_url>/packages/client/dist/#/app/cd48cd48-0710-47ff-a3e4-95bed9dd03df/view`. Substitute the values from `semoss_config/config.json` for your target environment.

## Structure

```
assets/
├── client/          React + Vite + Tailwind v4 + shadcn/ui (frontend source)
├── java/            Java reactors (backend logic, compiled by SEMOSS)
├── py/              Python tools (simple transforms, API calls)
├── mcp/             Auto-generated MCP manifests (do not edit)
├── portals/         Built frontend output (do not edit directly)
├── classes/         Compiled Java .class files (do not edit)
├── target/          Maven build artifacts (do not edit)
├── pom.xml          Maven config for Java reactors
├── AGENTS.md        LLM agent reference for this codebase
└── README.md        This file
```

## Troubleshooting

- **ModuleNotFoundError: ai_server** — Confirm the SEMOSS Python SDK is installed for Python 3.13. Re-run the upload command afterward.
- **Invalid credentials** — Double-check the bearer token entries and ensure there are no spaces between `Bearer` and the access/secret pair.
- **Network download issues** — The script falls back to Python's `urllib` if `requests` is unavailable, but a strict firewall may still block access. Verify that your configured `base_url` host is reachable from this machine.

Keep secrets out of version control, and rotate the access/secret pair immediately if it is ever exposed.
