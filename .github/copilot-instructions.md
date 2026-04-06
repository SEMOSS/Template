You are creating applications for the SEMOSS platform. Use Python only for simple local operations such as base64 conversion. Local means this desktop workspace. SEMOSS means the remote project/app.

If `semoss_config` is missing, first ask which SEMOSS instance to use and record `base_url`. Always present the default values below and explicitly ask whether the user wants to use them — do not assume:
- `base_url`: `https://workshop.cfg.deloitte.com/`
- `api_module_url`: `/cfg-ai-dev/Monolith`
- `web_module_url`: `/cfg-ai-dev/SemossWeb`

Replace these values in `.vscode/mcp.json` when you start. If the access key and secret key placeholders are still present, ask the user for them and update the MCP config before doing anything else. Once the keys are set or changed, tell the user to reload VS Code by using `Developer: Reload Window` so MCP reconnects with the new credentials. If they are already present, confirm that and continue.

If the project name is `vibe_setup_vscode`, remind the user to rename it. Keep that reminder short and occasional.

Your workflow always starts with:

a. Check whether the folder is already linked to SEMOSS by looking for `semoss_config`.
b. If it is not linked, ask whether to create a new SEMOSS project or link an existing one.
c. When creating a new project, also ask: "Do you want this app to be agent-enabled and expose tools or skills through MCP?"
d. If the user says yes, pass that value into the `mcp` argument of the create-project tool and store that flag in `semoss_config/config.json`.
e. Also ask whether the user wants a full app UI, an agent-enabled app, or only MCP/agent tools with no working app UI requirement.
f. Save `semoss_config/config.json` as JSON with at least: project/app id, module, created_on, base_url, api_module_url, web_module_url, and `is_mcp`. Prompt users for values when needed, but always show the default and ask for confirmation before applying it. Never silently apply defaults.
g. Persist that config into the remote project's config directory as well.
h. After the project is linked or created, check whether `gcai.config` exists in the workspace root. If it is missing or any required property is absent, prompt the user for each value individually — always show the suggested default and ask whether to use it. Never silently apply a default. Write/update `gcai.config` with:
   - `BASE_URL` — fully qualified API base URL (suggested default: `base_url` + `api_module_url` from `semoss_config`, e.g. `https://workshop.cfg.deloitte.com/cfg-ai-dev/Monolith`)
   - `PROJECT_ID` — the project/app ID (suggested default: value from `semoss_config/config.json`)
   - `IS_MCP` — `true` or `false` (suggested default: value from `semoss_config/config.json`)
   - `ACCESS_KEY` and `SECRET_KEY` — credentials for the SEMOSS instance. These must be added manually by the user; do not prompt for them interactively.
   
   The file format is `KEY=VALUE`, one per line. Example:
   ```
   BASE_URL=https://workshop.cfg.deloitte.com/cfg-ai-dev/Monolith
   PROJECT_ID=0076968e-eedf-49b9-b2d8-bf72147b2a3e
   IS_MCP=true
   ACCESS_KEY=myAccessKey
   SECRET_KEY=mySecretKey
   ```
   If `gcai.config` already exists with all five keys present, read them, confirm the values with the user, and continue.
i. Ask if they want to create a database or use an existing and prompt for the database_id.

When saving files, always use the `ai_server` SDK or the helper in `scripts/semoss_asset_sync.py`.

```python
from ai_server import ServerClient

server_connection = ServerClient(base='https://workshop.cfg.deloitte.com/cfg-ai-dev/Monolith/api/', access_key=access, secret_key=secret)
insight_id = server_connection.make_new_insight()
server_connection.upload_files(files=[local_file], project_id=project_id, insight_id=f"{insight_id}", path="/version/assets/<folder>")
server_connection.run_pixel('1+1')
```

Before upload, check whether the remote file already exists. If it does, ask the user before deleting it. After delete and after upload, publish the project. Then list files so the result is visible.

If databases are involved, never create the database through MCP. Always direct the user to create the database in the UI first so they stay in control of the setup decisions, review the inputs, and confirm the final configuration. After that, ask for the database id, get the schema, decode the base64 payload, and store the schema in `semoss_config`. Use Python for base64 conversion when needed.

For all database SQL operations (DDL and DML), use the `SqlQuery` reactor — do NOT use `Database(...)|Query(...)` or `Database(...)|Update(...)`:
- **Read queries:** `SqlQuery(database=["<db_id>"], query=["<SQL>"])` via `actions.run()` or `server_connection.run_pixel()`
- **DDL / writes:** `SqlQuery(database=["<db_id>"], query=["<SQL>"], queryType=["update"], commit=[true])` for CREATE, ALTER, INSERT, UPDATE, DELETE, DROP

After any successful SQL DDL or DML changes (CREATE, ALTER, INSERT, UPDATE, DELETE, DROP):
1. **Create a migration script** — save the SQL to `data/migration_<NNN>_<short_description>.sql` where NNN is a zero-padded sequence number (e.g. `001`, `002`). Each file contains only the statements for that change, one statement per line, terminated with `;`.
2. **Update the schema file** — reflect the change in `semoss_config/schema.sql` (or `semoss_config/schema.json` if that is what exists). For DDL changes update table/column definitions; for seed data changes add a comment noting the data was seeded.
Both steps are mandatory — do not skip either one.

UI guidance:
- The APP key in the .env in the Client folder corresponds to the project/app id in SEMOSS. Make sure to set that when creating or linking a project.
- Unless the user says otherwise, build the UI as a single page HTML app.
- If the user says they only want MCPs / agent tools and do not care about a working app UI, skip the portal work and focus on the exposed MCP functions, their implementation, and any supporting files.
- If the app is marked as agent-enabled, do not stop at the HTML UI. Also identify which tools and reusable skills should be exposed through MCP.
- Present that proposed agent tool/skill list to the user and ask for confirmation before implementing it.
- After confirmation, create `py/mcp_driver.py` with the approved MCP functions using the SEMOSS MCP conventions.
- If there is a UI, wire the approved agent-backed actions into `portals/index.html` in the relevant places.

MCP-specific behavior:
- The MCP python driver lives at `py/mcp_driver.py` locally and becomes `version/assets/py/mcp_driver.py` remotely.
- Use the SEMOSS MCP conventions and annotations for functions exposed from `mcp_driver.py`.
- When syncing an MCP project and `py/mcp_driver.py` exists, also run the `MakePythonMCP` reactor with the project id so SEMOSS generates `py_mcp.json`.
- Keep this logic inside `scripts/semoss_asset_sync.py` so the template stays reusable.

Every time you make modifications, offer to synchronize local changes to SEMOSS and offer the app URL:
`<base_url><web_module_url>/packages/client/dist/#/app/<project_id>/view`

If the user wants to create a database, offer:
`<base_url><web_module_url>/packages/client/dist/#/app/394404bf-02e5-44b2-bc7c-e93d9b698f58/view`

If the user wants to open an existing database, offer:
`<base_url><web_module_url>/packages/client/dist/#/engine/database/<database_id>`

If the task is complex, show a short task list and ask the user to confirm before proceeding.

Do not put write-file style calls into context. It wastes context.

Use only the specified MCPs. Do not install new libraries. Do not create a virtual environment. You can run simple Python commands, but do not use Pylance and do not use unnecessary MCPs.

As a starting point, list the available MCP tools so the user knows what is available.

For java, if there is a database id involved in the project, updated the one in java/project.properties so reactors are calling the correct database.

Be concise. Keep code and instructions reviewable.

# SEMOSS MCP Tool Development

> **This is a template app.** The weather tool (`GetWeatherReactor.java`, `ExampleComponent.tsx`) and the temperature converters (`py/mcp_driver.py`) are placeholder examples that demonstrate patterns. When a user asks you to build new functionality, **replace these example files** with implementations that serve the requested purpose. Do not preserve or work around the weather/temperature examples — treat them as scaffolding to be overwritten.

Concise reference for building SEMOSS MCP tools. For working code examples, see the inline comments throughout the codebase — especially `py/mcp_driver.py` (Python tools with default UI), `client/src/components/ExampleComponent.tsx` (React custom UI patterns), `java/src/reactors/GetWeatherReactor.java` (Java reactor patterns), and `java/src/reactors/AbstractProjectReactor.java` (base class).

---

## Architecture

- **`client/`** — React + Vite + Tailwind v4 + shadcn/ui. Builds to `portals/` for publishing
- **`java/src/reactors/`** — Java reactors (complex logic, DB access, heavy computation)
- **`py/`** — Python tools (simple transforms, API calls, quick prototypes). Create `mcp_driver.py` when adding Python MCP tools
- **`mcp/`** — Auto-generated manifests (`py_mcp.json`, `pixel_mcp.json`). Never edit manually
- **`portals/`**, **`classes/`**, **`target/`** — Generated. Don't edit directly

## SDK

The primary hook is `useInsight()` from `@semoss/sdk/react`:
- `actions.run()` — Execute any Pixel command (reactors, queries, etc.)
- `actions.sendMCPResponseToPlayground(response, status, executedParams)` — Return results to Playground chat (3 args)
- `isInitialized` — True when SEMOSS SDK is ready
- `tool` — MCP invocation context: `tool.parameters` (prepopulated inputs), `tool.tool_response` (past execution result), `tool.executedParameters` (past execution params)

## Calling Tools from the Frontend

**Everything goes through `actions.run()`:**

- **Java reactors:** `actions.run('YourTool(param=...')')` — drop the "Reactor" suffix from class name
- **Python MCP tools:** `actions.run('RunMCPTool(project=["${PROJECT_ID}"], function=["my_tool_name"], paramValues=[{param1:'a',param2:'b'}])')` — this calls the `RunMCPTool` Pixel reactor
- **Escape params with `JSON.stringify()`:** `actions.run(\`Your(text=${JSON.stringify(userInput)})\`)`
- **Check for errors:** `pixelReturn[0].operationType.includes("ERROR")`
- **Send to Playground after:** `actions.sendMCPResponseToPlayground(JSON.stringify(result), "success", { param })`

### `actions.runMCPTool()` is Deprecated

`actions.runMCPTool()` (SDK method) and `RunMCPTool()` (Pixel reactor) have confusingly similar names but are different:
- **`actions.runMCPTool()`** — Deprecated SDK method. Calls Python tools but **also immediately sends the response to Playground**, which is usually unintended
- **`RunMCPTool()`** — Normal Pixel reactor called via `actions.run()`. No auto-send. This is the correct way to call Python tools

## Development Workflow

1. `pnpm i` in both root and `client/`
2. Set `APP="your-app-id"` in `client/.env.local`
3. `pnpm dev` for development, `pnpm build` for production
4. Build then publish via SEMOSS UI. If `portals/` is missing, run `pnpm i && pnpm build` in `client/`

## MCP Manifests

Manifests are auto-generated. Never edit `mcp/*.json` directly.

**Python:** Do NOT edit `mcp/py_mcp.json` directly. Instead, provide the user with the `MakePythonMCP()` Pixel command to run in the SEMOSS Playground — it reads the `@mcp_metadata` decorators from `py/mcp_driver.py` and regenerates the manifest automatically. No arguments needed:
```
MakePythonMCP();
```

**Java:** Do NOT edit `mcp/pixel_mcp.json` directly. Instead, provide the user with the `MakePixelMCP()` Pixel command to run in the SEMOSS Playground — it reads the reactor class and regenerates the manifest automatically.

Example command for a reactor with a custom sidebar UI:
```
MakePixelMCP(reactor=["GeneratePresentation"], mcpMetadata=[{ "SMSS_MCP_UI": { "displayLocation": "sidebar", "resourceURI": "/#/" }, "SMSS_MCP_EXECUTION": "ask" }]);
```

**MCP metadata options:** `resourceURI` (React route for custom UI, e.g. `/#/` — omit for default UI), `execution` (`"ask"` / `"auto"` / `"disabled"`), `loadingMessage` (custom message shown during auto-execution), `displayLocation` (`"inline"` / `"sidebar"` / `"none"`)

## Default UI vs Custom UI

Tools can use either the **default UI** or a **custom UI**:

- **Default UI:** When a tool's `resourceURI` is missing or null, Playground auto-generates a simple form with inputs for each parameter and a submit button. Best for simple tools that just take inputs and return outputs (e.g. temperature conversion, text transforms). No React code needed.
- **Custom UI:** When `resourceURI` points to a React route (e.g. `/#/`), Playground renders your app's frontend. Use this when you need rich interactions, visualizations, multi-step workflows, or custom layouts. Routes must use hash router (`/#/path`) because SEMOSS serves the app in an iframe — standard browser routing won't work.

Both Python and Java tools support either UI mode — just include or omit `resourceURI` in the MCP metadata. Python tools tend to be simple and typically use the default UI. The examples in `py/mcp_driver.py` use the default UI. The `GetWeather` Java reactor uses a custom UI defined in `client/src/components/ExampleComponent.tsx`.

## Java Reactor Rules

- Extend `AbstractProjectReactor`. See `GetWeatherReactor.java` for a working example
- `organizeKeys()` is called automatically by `preExecute()` — don't call it again in `doExecute()`
- Define params via `keysToGet` and `keyRequired` arrays (`1` = required, `0` = optional)
- Return `new NounMetadata(responseMap, PixelDataType.MAP)` — SEMOSS handles serialization
- Return errors via `NounMetadata.getErrorNounMessage("description")`
- Implement `getDescriptionForKey()` and `getReactorDescription()` for manifest generation
- `IModelEngine.ask()` returns response objects, not strings — use reflection to call `getResponse()`, never `toString()`
- Resolve a model engine by ID: `IModelEngine modelEngine = Utility.getModel(modelId);` (import `prerna.util.Utility`) — returns `null` if not found
- File paths: use `this.insight.getInsightFolder()`

## Python MCP Tool Rules

- Define tools in `py/mcp_driver.py` — this is the entry point SEMOSS looks for
- Every tool needs `@mcp_metadata` decorator (from `smssutil`, auto-injected by SEMOSS). Pass a dict: `@mcp_metadata({"execution": "auto"})`
- Use type hints on all parameters — they become required MCP parameters
- Tool title is parsed from the function name; description is parsed from the docstring
- Return JSON strings from tools
- Omit `resourceURI` in `@mcp_metadata` to use the default Playground UI (recommended for simple tools)
- `ROOT` is injected by SEMOSS for file path access
- Use `ModelEngine` from `ai_server` for LLM calls; always accept `model_id` as a parameter
- See `py/mcp_driver.py` for working examples (fahrenheit/celsius converters)

## React UI Rules

- Use `tool.parameters` for prepopulated values (NOT `tool.inputs`)
- Use `tool.tool_response` / `tool.executedParameters` to display past execution results
- Handle responses that may be objects, strings, or double-encoded strings
- Fetch models via: `actions.run('MyEngines(metaKeys=[], metaFilters=[{"tag":"text-generation"}], engineTypes=["MODEL"])')`
- Call `sendMCPResponseToPlayground()` directly — don't wrap it. SDK handles tool name matching
- Gate rendering on `isInitialized` (see `InitializedLayout.tsx`)

## File Pointers

| What | Where |
|------|-------|
| React entry | `client/src/index.tsx`, `client/src/App.tsx` |
| Routes | `client/src/pages/Router.tsx` |
| Components | `client/src/components/` |
| Example MCP UI | `client/src/components/ExampleComponent.tsx` (**template — replace with your UI**) |
| Tailwind v4 theme | `client/src/index.css` |
| Vite config | `client/vite.config.ts` |
| shadcn/ui config | `client/components.json`, `client/tailwind.config.js` (kept for CLI) |
| Java reactors | `java/src/reactors/` |
| Base reactor class | `java/src/reactors/AbstractProjectReactor.java` |
| Example reactor | `java/src/reactors/GetWeatherReactor.java` (**template — replace with your reactor**) |
| Java utilities | `java/src/util/` |
| Python MCP tools | `py/mcp_driver.py` (temperature converters — **template examples, replace with your tools**) |
| Manifests | `mcp/py_mcp.json`, `mcp/pixel_mcp.json` (auto-generated) |
| Published app | `portals/index.html` |

## Do Not

- Edit `portals/`, `classes/`, `target/`, or `mcp/*.json` — these are auto-generated. Give the user the `MakePixelMCP()` or `MakePythonMCP()` Pixel command to run instead
- Use the deprecated `actions.runMCPTool()` SDK method
- Use `toString()` on `IModelEngine` responses in Java
- Access `tool.inputs` in React (use `tool.parameters`)
- Commit secrets in `.env.local`
- Call `organizeKeys()` inside `doExecute()` (it's already called)
- Forget `@mcp_metadata` in Python or `getDescriptionForKey()`/`getReactorDescription()` in Java
- Wrap `sendMCPResponseToPlayground()` with custom logic
- Include "Reactor" suffix when calling reactors in Pixel commands
