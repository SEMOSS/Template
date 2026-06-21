---
name: semoss-mcp-manifest
description: Use when adding, editing, or wiring up a SEMOSS MCP tool manifest — mcp/py_mcp.json (Python tools) or mcp/pixel_mcp.json (Java reactors). Covers the manifest schema, the _meta fields (resourceURI, SMSS_MCP_EXECUTION, displayLocation, loadingMessage), mapping a tool's resourceURI to a hash route in Router.tsx, default vs custom UI, and when to fall back to the MakePythonMCP/MakePixelMCP regenerator reactors. Do not use for the deploy/upload flow (see semoss-deploy) or writing the tool logic itself (Java reactor / Python tool rules live in CLAUDE.md).
---

# MCP Tool Manifests

Tools surfaced in Playground chat are declared in two manifests:

- **`mcp/py_mcp.json`** — Python tools from `py/mcp_driver.py`.
- **`mcp/pixel_mcp.json`** — Java reactors from `java/src/reactors/`.

**Hand-edit these directly.** It is the reliable, default path. The existing entries
(`GetWeather`, the temperature converters) are working examples to copy.

> **When does a manifest entry exist?**
> - **Python:** *always* needs `mcp/py_mcp.json`. The frontend dispatches Python through
>   the `RunMCPTool` Pixel reactor, which reads this manifest. No entry → no dispatch,
>   even for app-internal calls.
> - **Java:** app-internal calls (`actions.run('Foo(...)')`) work with **no** manifest.
>   Add to `mcp/pixel_mcp.json` *only* to expose a reactor as a tool in Playground chat.

## Schema

Top level is `{ "_meta": {...}, "tools": [...] }`. Each tool entry:

```json
{
  "name": "GetWeather",
  "title": "GetWeather",
  "description": "Get the weather forecast for a city.",
  "inputSchema": {
    "type": "object",
    "title": "Weather_Arguments",
    "properties": {
      "city": {
        "type": "string",
        "title": "city",
        "description": "The city to get the weather forecast for."
      }
    },
    "required": ["city"]
  },
  "_meta": {
    "SMSS_FUNCTION_NAME": "GetWeather",
    "SMSS_MCP_EXECUTION": "ask",
    "SMSS_MCP_UI": { "resourceURI": "/#/" }
  }
}
```

- `name` / `title` — tool identity. For Java, this is the reactor name **without** the
  `Reactor` suffix (`GetWeatherReactor` → `GetWeather`).
- `description` — what the LLM reads to decide when to call the tool. Keep it precise.
- `inputSchema` — JSON Schema. What its keys must match depends on the UI mode, and this
  trips people up:
  - **Default UI (no `resourceURI`):** the platform builds the reactor/tool call straight
    from the form, so each property key must **exactly** match the Java `keysToGet` entry /
    Python parameter name. Typos fail silently (the field just stays empty).
  - **Custom UI (`resourceURI` set):** the schema only describes what the LLM prepopulates
    into `tool.parameters`; **your React code** assembles the actual `actions.run(...)`
    call. So the keys must match what your component reads from `tool.parameters` — which
    you then map to reactor keys yourself, and the two needn't be identical.
- `_type: "python"` — present on Python entries; omit on Java/Pixel entries.

## `_meta` fields

- **`SMSS_FUNCTION_NAME`** — the backend function/reactor to dispatch to.
- **`SMSS_MCP_EXECUTION`** — how Playground runs the tool:
  - `"auto"` — runs directly, no user interaction. Best for fast, side-effect-free
    transforms (the temperature converters use this). `auto` is **compatible with a
    `resourceURI`**: the tool still fires automatically on invocation, and the user can
    open its custom UI afterward to review or re-run — `auto` controls the *initial* run,
    not whether a UI exists.
  - `"ask"` — opens the custom UI for the user to review/edit/supply input first. Use
    when human review matters or the UI drives data entry.
  - `"disabled"` — declared but not callable; useful for staging.
- **`SMSS_MCP_UI`** — render metadata:
  - `resourceURI` — see UI mapping below.
  - `displayLocation` — `"inline"` / `"sidebar"` / `"none"`.
  - `loadingMessage` — shown during auto-execution (e.g. `"Converting temperature..."`).

## Default UI vs custom UI — the `resourceURI` decision

| `resourceURI` | What renders | When |
|---|---|---|
| Omitted / null | Playground auto-generates a form from `inputSchema` | Simple input→output transforms |
| `/#/` or `/#/path` | Your React route at that path | Rich UI, multi-step flows, visualizations |

The path **must** use the hash router (`/#/...`) — Playground embeds apps in iframes that
don't support browser history. If `resourceURI` points to a path missing from
`Router.tsx`, the catch-all redirects to `/`: the tool looks like it worked but renders
the wrong UI.

### Custom-UI tools: always do both steps in one change

1. Add the route in `client/src/pages/Router.tsx` (e.g. `{ path: '/forecast', Component: ForecastPage }`).
2. Set `resourceURI` in the manifest entry to match (`"resourceURI": "/#/forecast"`).

Two tools sharing a `resourceURI` render the same component — disambiguate by inspecting
`tool.parameters`, or (cleaner) give each tool its own route.

**`resourceURI` is static — it can't carry a dynamic route segment.** You can't point a tool
at `/#/cases/:id` to open a specific record. Route to a parameterless page (`/#/case`) and
pass the identifier through `inputSchema` → `tool.parameters`, then read it in the component
and fetch accordingly. The route stays fixed; the data varies by parameter.

## Regenerator reactors (troubleshooting only)

The platform exposes `MakePythonMCP(<project_id>)` and
`MakePixelMCP(reactor=["<Name>"], mcpMetadata=[...])` Pixel reactors that rebuild the
manifests from source decorators/annotations. They are the "ideal" in principle but
finicky in practice. **Reach for them only to troubleshoot** a manifest hand-editing
isn't getting right — don't make them the default path.
