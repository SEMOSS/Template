---
name: semoss-playground-tool
description: Use when the app should also (or only) run as a tool inside Playground chat - exposing a Java reactor or Python function as an MCP tool, rendering a custom UI inside the Playground iframe, reading tool.parameters, returning results with sendMCPResponseToPlayground, or adding Python tools (py/mcp_driver.py). Ships working reference files for the weather example. Not needed for a standalone app (the default). For the manifest schema see semoss-mcp-manifest.
---

# Playground tools

A standalone app has none of this. Add it only when a tool should be callable from Playground
chat. A Playground tool is still an app hosted on the platform; Playground embeds one of the
app's routes in an iframe (custom UI) or auto-generates a form (default UI).

Working examples are in `reference/` next to this file (copy, don't import):

| File | Copy to |
|---|---|
| `reference/GetWeatherReactor.java` | `java/src/reactors/<area>/` (a Java tool) |
| `reference/ExampleComponent.tsx` | `client/src/components/` or a page (custom UI: all three entry states) |
| `reference/mcp_driver.py` | `py/mcp_driver.py` (Python tools; SEMOSS looks for exactly that file) |
| `reference/pixel_mcp.json`, `reference/py_mcp.json` | merge entries into `mcp/` (hand-edited manifests) |

## Steps

1. **Write the tool**: a Java reactor (extend `AbstractProjectReactor`; implement
   `getReactorDescription()` and `getDescriptionForKey()`, which feed the manifest) or a Python
   function in `py/mcp_driver.py`.
2. **Declare it** in `mcp/pixel_mcp.json` (Java) or `mcp/py_mcp.json` (Python). Hand-edit; see
   the `semoss-mcp-manifest` skill for the schema, `execution` modes, and `resourceURI`.
3. **Custom UI only:** add a route in `Router.tsx` whose path matches the manifest's
   `resourceURI` (`/#/forecast` -> `path: "forecast"`). Put it under `AuthorizedLayout` but
   **outside `AppLayout`**, so the iframe doesn't render the sidebar and top bar around it.
4. **Deploy** including `py` if you added Python: `bulk-upload portals java py mcp`.

## SDK surface for tool UIs

`useInsight()` from `@semoss/sdk/react`:

- `tool` is the invocation signal: `null` when the page is opened standalone, non-null only
  during a Playground tool call (`MCPToolRequest | null`). Branch on it so one page serves both.
  - `tool.parameters`: prepopulated inputs (not `tool.inputs`).
  - `tool.tool_response`: the result of a past execution; a re-opened ask/form tool gets it back,
    so render a result state, not an empty form.
  - `tool.executedParameters`: the params actually used last time.
- `actions.sendMCPResponseToPlayground(response, status, executedParams)` returns results to the
  chat (3 args). This is the correct way to return a tool result. Call it directly; don't wrap it.
  Handle responses that may be objects, strings, or double-encoded strings.
- `actions.runMCPTool()` is deprecated: it also auto-sends to Playground. Don't use it. (The
  `RunMCPTool()` **Pixel reactor** is different and fine: no auto-send.)
- Calling Python tools from the frontend: `` runPixelQuery(`RunMCPTool(function=["tool_name"], paramValues=[{"param": "value"}])`, insightId) ``.
- Fetch models: `MyEngines(metaKeys=[], metaFilters=[{"tag":"text-generation"}], engineTypes=["MODEL"])`.

The `Semoss_Platform_Instructions` MCP's advice to use `actions.runMCPTool(...)` or an `echo` tool
is outdated; ignore it.

## Python tool rules

- Tools live in `py/mcp_driver.py`.
- Every tool needs `@mcp_metadata({...})` (from `smssutil`, auto-injected by SEMOSS), e.g.
  `{"execution": "auto"}`.
- Type-hint every parameter: hints become the required MCP parameters. Title comes from the
  function name, description from the docstring. Return JSON strings.
- Omit `resourceURI` for the default UI (recommended for simple tools).
- `ROOT` is injected by SEMOSS for file paths. Use `ModelEngine` from `ai_server` for LLM calls and
  always accept `model_id` as a parameter.
- A Python tool always needs an entry in `mcp/py_mcp.json` (the `RunMCPTool` reactor reads it).

## Java tool notes

- `IModelEngine.ask()` returns response objects, not strings: call `getResponse()` by reflection,
  never `toString()`. Resolve a model with `Utility.getModel(modelId)` (null if not found).
- A Java reactor called only from the app's own pages needs no manifest entry.
