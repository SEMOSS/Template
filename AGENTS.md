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
- **Python MCP tools:** `actions.run('RunMCPTool(tool=["tool_name"], param=...)')` — this calls the `RunMCPTool` Pixel reactor
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
