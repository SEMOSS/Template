# SEMOSS MCP Tool Development

> **This is a template app.** The weather tool (`GetWeatherReactor.java`, `ExampleComponent.tsx`) and the temperature converters (`py/mcp_driver.py`) are placeholder examples that demonstrate patterns. When a user asks you to build new functionality, **replace these example files** with implementations that serve the requested purpose. Do not preserve or work around the weather/temperature examples — treat them as scaffolding to be overwritten.

Concise reference for building SEMOSS MCP tools. For working code examples, see the inline comments throughout the codebase — especially `py/mcp_driver.py` (Python tools with default UI), `client/src/components/ExampleComponent.tsx` (React custom UI patterns), `java/src/reactors/GetWeatherReactor.java` (Java reactor patterns), and `java/src/reactors/AbstractProjectReactor.java` (base class).

---

## Session Start Checklist

Run through these at the start of every session, in order:

1. **MCP servers configured?** — Read `.mcp.json`. If it still contains any of the placeholders (`<base_url>`, `<api_module_url>`, `<accessKey>`, `<secretKey>`), follow [First-Time Setup](#first-time-setup-agent-instructions) before doing anything else. Once connected, call `Semoss_Platform_Instructions: get_agent_platform_instructions` to load up-to-date platform guidance for the session.

2. **Frontend deps installed?** — Check whether `client/node_modules/` exists. If not, run `pnpm i` inside `client/`.

3. **App ID set?** — Check `client/.env.local`. It must contain `APP="<your-app-id>"`. If missing or still a placeholder, ask the user for their app ID (visible in the SEMOSS UI URL when the app is open).

4. **Orient to what's been built** — Skim `py/mcp_driver.py`, `java/src/reactors/`, and `client/src/components/` to understand whether the template examples have been replaced or if this is a fresh start.

---

## SEMOSS MCP Servers (Available to Agents)

This project ships a `.mcp.json` at the repo root. When connected, agents have access to three SEMOSS platform MCP servers:

| Server | Purpose |
|--------|---------|
| `Semoss_Platform_Instructions` | Call `get_agent_platform_instructions` at session start and whenever you're unsure about a SEMOSS feature — it returns up-to-date Pixel commands, API patterns, and response payload formats for the platform. |
| `Semoss_project_manager` | Publish apps, search for projects by name, list and delete project files, create new projects, and manage tags — all without touching the SEMOSS UI. The `project_id` needed by most tools is the `APP` value in `client/.env.local`. |
| `Semoss_database_helper` | Search for available databases by name, fetch and simplify a database schema (also saves it to `schema/schema.json` in the app assets), and run SQL queries or multi-statement scripts directly against any connected database. |

**When vibe coding:** Use these servers actively — they replace most of what you'd otherwise ask the user to do in the UI.
- Before writing any Pixel command or reactor logic, call `get_agent_platform_instructions` to get current platform guidance.
- Before writing a reactor that queries a database, use `Semoss_database_helper` to search for the database and inspect its schema.
- After `pnpm build`, publish with `Semoss_project_manager` rather than asking the user to click through the app editor.

### First-Time Setup (Agent Instructions)

`.mcp.json` ships with placeholders. **If you see `<base_url>`, `<api_module_url>`, `<accessKey>`, or `<secretKey>` in `.mcp.json`, the file has not been configured yet.** Do the following:

1. **Ask the user for their four values:**
   - `base_url` — SEMOSS server base URL (matches `ENDPOINT` in `client/.env`, e.g. `http://localhost:9090`)
   - `api_module_url` — API module path (matches `MODULE` in `client/.env`, e.g. `/Monolith`)
   - `accessKey` — their SEMOSS access key (from SEMOSS user settings)
   - `secretKey` — their SEMOSS secret key (from SEMOSS user settings)

2. **Edit `.mcp.json`** — replace all four placeholders with the values provided. There are three server entries; replace the same placeholders in each.

3. **Remove `.mcp.json` from version control** so credentials are never committed:
   ```
   git rm --cached .mcp.json
   echo '.mcp.json' >> .gitignore
   git add .gitignore
   ```

4. **Reload the window** so the agent picks up the updated `.mcp.json` and connects to the servers. Ask the user to reload their VS Code window: **Cmd+Shift+P → "Developer: Reload Window"** (or Ctrl+Shift+P on Windows/Linux).

---

## Architecture

- **`client/`** — React + Vite + Tailwind v4 + shadcn/ui. Builds to `portals/` for publishing
- **`java/src/reactors/`** — Java reactors (complex logic, DB access, heavy computation)
- **`py/`** — Python tools (simple transforms, API calls, quick prototypes). Create `mcp_driver.py` when adding Python MCP tools
- **`mcp/`** — MCP manifests (`py_mcp.json`, `pixel_mcp.json`). Cleanest path is regenerating via Pixel commands; agents can also write them directly
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
- **Python MCP tools:** `actions.run('RunMCPTool(function=["tool_name"], paramValues=[{"param": "value"}])')` — this calls the `RunMCPTool` Pixel reactor
- **Escape params with `JSON.stringify()`:** `actions.run(\`Your(text=${JSON.stringify(userInput)})\`)`
- **Check for errors:** `pixelReturn[0].operationType.includes("ERROR")`
- **Send to Playground after:** `actions.sendMCPResponseToPlayground(JSON.stringify(result), "success", { param })`

### `actions.runMCPTool()` is Deprecated

`actions.runMCPTool()` (SDK method) and `RunMCPTool()` (Pixel reactor) have confusingly similar names but are different:
- **`actions.runMCPTool()`** — Deprecated SDK method. Calls Python tools but **also immediately sends the response to Playground**, which is usually unintended
- **`RunMCPTool()`** — Normal Pixel reactor called via `actions.run()`. No auto-send. This is the correct way to call Python tools

## Development Workflow

**First-time setup:**
1. `pnpm i` inside `client/`
2. Create `client/.env.local` with `APP="your-app-id"` (get the ID from the SEMOSS UI URL)

**Ongoing:**
3. `pnpm dev` inside `client/` — local dev server with hot reload (proxies to SEMOSS backend via `ENDPOINT`/`MODULE` in `.env`)
4. `pnpm build` inside `client/` — production build, outputs to `portals/`
5. Publish after building — call `Semoss_project_manager: publish_project` with the `project_id` from `client/.env.local` (`APP`), or manually click "Publish files" in the SEMOSS app editor

If `portals/` is missing or stale, run `pnpm i && pnpm build` in `client/` to regenerate it.

## MCP Manifests

Manifests in `mcp/` are normally auto-generated from source — prefer keeping them in sync that way. But agents can also edit them directly when it's more practical (e.g., tweaking metadata without changing source files).

**Python — preferred:** Run `MakePythonMCP()` in the SEMOSS Playground. It reads the `@mcp_metadata` decorators from `py/mcp_driver.py` and regenerates `mcp/py_mcp.json` automatically. No arguments needed:
```
MakePythonMCP();
```
**Python — direct:** Agents can also write `mcp/py_mcp.json` directly — useful when the user isn't running the Playground or when quick iteration is more important than going through the source decorator flow.

**Java — preferred:** Run `MakePixelMCP()` in the SEMOSS Playground. It reads the reactor class and regenerates `mcp/pixel_mcp.json` automatically.
**Java — direct:** Agents can also write `mcp/pixel_mcp.json` directly for the same reasons.

Example command for a reactor with a custom sidebar UI:
```
MakePixelMCP(reactor=["GeneratePresentation"], mcpMetadata=[{ "SMSS_MCP_UI": { "displayLocation": "sidebar", "resourceURI": "/#/" }, "SMSS_MCP_EXECUTION": "ask" }]);
```
> **Route must exist:** The `resourceURI` value (e.g. `/#/` or `/#/generate`) must correspond to a route defined in `client/src/pages/Router.tsx`. If the route doesn't exist, the tool UI will hit the catch-all and redirect to `/`.

**MCP metadata options:** `resourceURI` (React route for custom UI — must match a route in Router.tsx; omit for default UI), `execution` (`"ask"` / `"auto"` / `"disabled"`), `loadingMessage` (custom message shown during auto-execution), `displayLocation` (`"inline"` / `"sidebar"` / `"none"`)

## Default UI vs Custom UI

Tools can use either the **default UI** or a **custom UI**:

- **Default UI:** When a tool's `resourceURI` is missing or null, Playground auto-generates a simple form with inputs for each parameter and a submit button. Best for simple tools that just take inputs and return outputs (e.g. temperature conversion, text transforms). No React code needed.
- **Custom UI:** When `resourceURI` points to a React route (e.g. `/#/`), Playground renders your app's frontend. Use this when you need rich interactions, visualizations, multi-step workflows, or custom layouts. Routes must use hash router (`/#/path`) because SEMOSS serves the app in an iframe — standard browser routing won't work.

Both Python and Java tools support either UI mode — just include or omit `resourceURI` in the MCP metadata. Python tools tend to be simple and typically use the default UI. The examples in `py/mcp_driver.py` use the default UI. The `GetWeather` Java reactor uses a custom UI defined in `client/src/components/ExampleComponent.tsx`.

### Routing for Custom UI Tools

**Be intentional with routes.** The `resourceURI` in MCP metadata maps directly to a route in `client/src/pages/Router.tsx`. Every tool with a custom UI needs a deliberate route assignment:

- **`/#/`** → the root route (`/` in Router.tsx). Use this only if the app has a single tool with a custom UI, or if you intentionally want multiple tools to share the same UI.
- **`/#/tool-name`** → a dedicated route (`/tool-name` in Router.tsx). Use this when the app has multiple tools that each need their own UI.

**When adding a new tool with a custom UI, always do both steps:**
1. Add a route in `Router.tsx` (e.g. `{ path: '/generate', Component: GeneratePage }`)
2. Set `resourceURI` in the `MakePixelMCP()` call to match (e.g. `"resourceURI": "/#/generate"`)

If two tools point to the same `resourceURI`, they will render the same component — the UI won't know which tool invoked it unless you inspect `tool.parameters`. In most cases, give each tool its own route.

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

- Edit `portals/`, `classes/`, or `target/` — these are build artifacts, always regenerated
- Edit `mcp/*.json` when source is also changing — run `MakePixelMCP()` or `MakePythonMCP()` instead so the manifest stays in sync with the code. Writing the JSON directly is fine when the user can't run those commands
- Use the deprecated `actions.runMCPTool()` SDK method
- Use `toString()` on `IModelEngine` responses in Java
- Access `tool.inputs` in React (use `tool.parameters`)
- Commit secrets in `.env.local`
- Call `organizeKeys()` inside `doExecute()` (it's already called)
- Forget `@mcp_metadata` in Python or `getDescriptionForKey()`/`getReactorDescription()` in Java
- Wrap `sendMCPResponseToPlayground()` with custom logic
- Include "Reactor" suffix when calling reactors in Pixel commands
