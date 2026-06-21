---
name: semoss-platform-backend
description: Use when working with the SEMOSS platform control plane via the connected MCP servers — creating/publishing/tagging projects (Semoss_project_manager), creating/querying databases and fetching schema (Semoss_database_helper), or pulling platform guidance (Semoss_Platform_Instructions). Covers the project lifecycle, the MCP project tag that gates Playground-chat visibility, standalone-vs-MCP app modes, and which of the platform MCP's frontend claims to ignore. Do not use for in-app SDK calls from React (see CLAUDE.md + the engine skills) or for the deploy mechanics (see semoss-deploy).
---

# Platform Backend (MCP Control Plane)

Several `Semoss_*` MCP servers are usually connected. They drive the platform's control
plane — creating projects, databases, tagging, publishing. Their **backend** tools are
genuinely useful; their **frontend** guidance is out of date.

> **Authority:** where these MCPs conflict with `CLAUDE.md`, `CLAUDE.md` wins. In
> particular, **ignore** any MCP advice to: use `actions.runMCPTool()` / an `echo` tool
> to return results (use `actions.sendMCPResponseToPlayground()`); hand-roll a portal with
> vanilla `new Insight()` from a CDN import (this template is React + Vite, use
> `useInsight()`); or treat `MakePythonMCP`/`MakePixelMCP` as the primary manifest path
> (hand-edit manifests — see `semoss-mcp-manifest`).

## The MCP servers

| Server | Purpose |
|--------|---------|
| `Semoss_Platform_Instructions` | Platform docs/guidance. `get_agent_platform_instructions` returns up-to-date guidance — call it before app work to verify connectivity, but filter its FE advice through the authority note above. |
| `Semoss_project_manager` | Project lifecycle: `create_project`, `publish_project`, `delete_project`, `search_project`, `list_files`, `delete_file`, `attach_tag`, `remove_tag`. |
| `Semoss_database_helper` | Databases: `create_new_db`, `run_query`, `run_script`, `get_schema`, `search_database`, `delete_database`, `add_to_context`, `split_sql_script`. |

**Do not create databases, projects, or other platform resources unless the user
explicitly asks.** The default workflow is build-locally-then-create. Resource creation
is a deliberate step.

## Project lifecycle

```
create_project (once per env) → upload assets (semoss-deploy) → publish_project
```

- **`create_project(project_name, description, project_type="CODE", mcp=<bool>)`** —
  returns JSON with `status`, `project_id`, `project_name`. Parse `project_id` → that's
  the `app_id`; save it into `environments.json` for the target env **before** deploying.
  Project names must be unique per instance — `create_project` hard-errors on collision,
  so `search_project` first if unsure.
- **`publish_project`** — snapshots already-uploaded assets to the public portal. The
  sync script's `bulk-upload` auto-publishes, so a separate call is usually unnecessary;
  use it to republish manually-uploaded assets without changing files. **Publish ≠
  upload.**
- There is **no upload tool** exposed via the MCPs — only lifecycle (create/publish/
  delete/tag) and file listing/deletion. Asset transfer goes through `semoss_asset_sync.py`
  (the platform itself recommends this) or the manual UI zip.

## Standalone vs MCP app modes — the `MCP` tag

An app is mechanically the same whether standalone or MCP-enabled; the one meaningful
difference is the **`MCP` project tag**, which gates whether its tools surface in
Playground chat:

- **Tagged `MCP`** → tools appear in chat.
- **Untagged** → tools don't appear in chat, but the app still works as a standalone
  portal and can still call its own Python/Java backend through the manifests.

Setting the tag (confirm with the user before applying any tag):

- **At creation:** pass `mcp=True` to `create_project`.
- **Converting an existing standalone app:** `attach_tag(project_id="<app_id>", tag="MCP")`.
  Python tools already in `mcp/py_mcp.json` surface immediately; Java reactors need an
  entry added to `mcp/pixel_mcp.json` first (see `semoss-mcp-manifest`), then redeploy.

Tagging is **only** available through the `Semoss_project_manager` MCP (`create_project`'s
`mcp=True`, or `attach_tag`/`remove_tag`) — there is no Pixel command or sync-script path.
So when that MCP server isn't connected to the instance, you can't tag programmatically:
hand the user into the platform UI to set the `MCP` tag on their app. Treat that hand-off
as the expected fallback, not a failure.

Other tags (`draft`, `approved`, etc.) are user-defined with no platform side effects.

## Databases

- **`get_schema`** returns **Base64-encoded** schema — decode before use. Writing the
  decoded schema into `semoss_config/` for reference is a useful pattern.
- `create_new_db`, `run_query`, `run_script`, `split_sql_script`, `delete_database`,
  `search_database`, `add_to_context` handle DB creation, querying, and context wiring.
- For **in-app** database access from the running React frontend, don't use these MCP
  tools — use `actions.run('SqlQuery(...)')` via `useInsight()` (see the `semoss-database`
  skill).

## URL patterns

| Purpose | Pattern |
|---|---|
| App view | `<base_url><web_module_url>/packages/client/dist/#/app/<app_id>/view` |
| App editor (manual zip upload) | `<base_url><web_module_url>/packages/client/dist/#/app/<app_id>/edit` |
| Database | `<base_url><web_module_url>/packages/client/dist/#/engine/database/<database_id>` |

## Startup checklist (when building/deploying)

1. **`.mcp.json`** — if missing, copy from `.mcp.json.example`; fill in
   `Authorization:Bearer <access>:<secret>`. MCP servers load only at startup, so after
   editing tokens, tell the user to restart before anything needing platform access works.
2. **Env config** — ensure `semoss_config/environments.json` and `credentials.env` exist
   (copy from `.example`, fill in).
3. **Connectivity** — `get_agent_platform_instructions` verifies the servers are reachable.
4. **Client deps** — `pnpm i` in `client/` if `node_modules/` is missing.
