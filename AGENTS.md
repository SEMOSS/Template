# SEMOSS MCP Tool Development

Concise reference for building SEMOSS MCP tools with custom UIs. For working code examples, see the inline comments throughout the codebase — especially `client/src/components/ExampleComponent.tsx` (React patterns), `java/src/reactors/HelloUserReactor.java` (Java reactor patterns), and `java/src/reactors/AbstractProjectReactor.java` (base class).

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

**Python:** Run `MakePythonMCP()` after adding/changing `@mcp_metadata` decorated functions in `py/mcp_driver.py`

**Java:** Run `MakePixelMCP(reactor=["ReactorName"], mcpMetadata=[...])` after changing reactors. Drop "Reactor" suffix from reactor names in this call.

**MCP metadata options:** `resourceURI` (React route, e.g. `/#/tool`), `execution` (`"ask"` / `"auto"` / `"disabled"`), `loadingMessage`, `displayLocation` (`"inline"` / `"sidebar"` / `"hidden"`)

## Java Reactor Rules

- Extend `AbstractProjectReactor`. See `HelloUserReactor.java` for a working example
- `organizeKeys()` is called automatically by `preExecute()` — don't call it again in `doExecute()`
- Define params via `keysToGet` and `keyRequired` arrays (`1` = required, `0` = optional)
- Return `new NounMetadata(responseMap, PixelDataType.MAP)` — SEMOSS handles serialization
- Return errors via `NounMetadata.getErrorNounMessage("description")`
- Implement `getDescriptionForKey()` and `getReactorDescription()` for manifest generation
- `IModelEngine.ask()` returns response objects, not strings — use reflection to call `getResponse()`, never `toString()`
- File paths: use `this.insight.getInsightFolder()`

## Python MCP Tool Rules

- Every tool needs `@mcp_metadata` decorator (from `smssutil`, auto-injected by SEMOSS)
- Use type hints on all parameters — they become required MCP parameters
- Return JSON strings from tools
- `ROOT` is injected by SEMOSS for file path access
- Use `ModelEngine` from `ai_server` for LLM calls; always accept `model_id` as a parameter

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
| Example MCP UI | `client/src/components/ExampleComponent.tsx` |
| Tailwind v4 theme | `client/src/index.css` |
| Vite config | `client/vite.config.ts` |
| shadcn/ui config | `client/components.json`, `client/tailwind.config.js` (kept for CLI) |
| Java reactors | `java/src/reactors/` |
| Base reactor class | `java/src/reactors/AbstractProjectReactor.java` |
| Example reactor | `java/src/reactors/HelloUserReactor.java` |
| Java utilities | `java/src/util/` |
| Python tools | `py/` (create `mcp_driver.py` for MCP tools) |
| Manifests | `mcp/py_mcp.json`, `mcp/pixel_mcp.json` (auto-generated) |
| Published app | `portals/index.html` |

## Do Not

- Edit `portals/`, `classes/`, `target/`, or `mcp/*.json`
- Use the deprecated `actions.runMCPTool()` SDK method
- Use `toString()` on `IModelEngine` responses in Java
- Access `tool.inputs` in React (use `tool.parameters`)
- Commit secrets in `.env.local`
- Call `organizeKeys()` inside `doExecute()` (it's already called)
- Forget `@mcp_metadata` in Python or `getDescriptionForKey()`/`getReactorDescription()` in Java
- Wrap `sendMCPResponseToPlayground()` with custom logic
- Include "Reactor" suffix when calling reactors in Pixel commands
