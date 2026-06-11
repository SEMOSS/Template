---
name: semoss-example-app
description: Use when you want a complete worked example of how a SEMOSS MCP tool is wired end-to-end — to learn or copy the full pattern before building a new tool. Walks through the template's two shipped examples: the GetWeather Java reactor + ExampleComponent.tsx custom UI (an "ask"-mode tool with a React UI), and the temperature converters in py/mcp_driver.py (auto-mode Python tools using the default UI). Shows how reactor ↔ manifest ↔ route ↔ component fit together. Do not use as the manifest field reference (see semoss-mcp-manifest) or the deploy steps (see semoss-deploy).
---

# Worked Example: End-to-End MCP Tools

The template ships two complete examples. Study these to learn the wiring, then **replace
them** when building real functionality — don't preserve or work around them.

## Example A — Java reactor + custom React UI ("ask" mode)

A weather tool the LLM can invoke, opening a React form pre-filled with the LLM's chosen
city, which the user reviews before the result is sent back to chat.

**The four pieces and how they connect:**

1. **Reactor** — `java/src/reactors/GetWeatherReactor.java`:
   ```java
   public class GetWeatherReactor extends AbstractProjectReactor {
     private static final String CITY_KEY = "city";
     public GetWeatherReactor() {
       this.keysToGet = new String[] {CITY_KEY};
       this.keyRequired = new int[] {1};          // 1 = required
     }
     @Override protected NounMetadata doExecute() {
       String city = this.keyValue.get(CITY_KEY);
       return new NounMetadata("It will be sunny in " + city + " today.",
                               PixelDataType.CONST_STRING);
     }
     @Override public String getReactorDescription() { return "Get the weather forecast for a city."; }
     @Override public String getDescriptionForKey(String key) {
       return CITY_KEY.equals(key) ? "The city to get the weather forecast for." : null;
     }
   }
   ```
   `getReactorDescription()` / `getDescriptionForKey()` feed the manifest. `organizeKeys()`
   is already called by `preExecute()` — don't call it in `doExecute()`.

2. **Manifest** — the `mcp/pixel_mcp.json` entry. `name` drops the `Reactor` suffix
   (`GetWeather`), `inputSchema.properties.city` matches `CITY_KEY`, `SMSS_MCP_EXECUTION`
   is `"ask"`, and `SMSS_MCP_UI.resourceURI` is `/#/` (points at the route below).

3. **Route** — `resourceURI: "/#/"` maps to the root route in `client/src/pages/Router.tsx`,
   which renders the component. (A dedicated tool would use `/#/forecast` + a matching route.)

4. **Component** — `client/src/components/ExampleComponent.tsx`. The canonical lifecycle:
   - Read inputs from `tool.parameters` (the LLM's values) — **not** `tool.inputs`.
   - Call the reactor: `` actions.run(`GetWeather(city=${JSON.stringify(city)})`) `` and
     check `pixelReturn[0].operationType.includes("ERROR")`.
   - Return to chat: `actions.sendMCPResponseToPlayground(forecast, "success", { city })`.
   - The single `useEffect` on `tool` handles the three states:

     | State | Detection | Action |
     |---|---|---|
     | Opened standalone | `tool` falsy | empty form; don't read `tool.parameters` |
     | Fresh invocation | `tool` set, `tool.tool_response` falsy | prefill from `tool.parameters`, optionally auto-run |
     | Past execution | `tool.tool_response` truthy | restore result; prefill from `tool.executedParameters` (fallback `tool.parameters`); mark "already sent" |

   Auto-running on prefill is good UX for cheap/idempotent actions (weather); wait for a
   button click when the action is expensive or destructive.

## Example B — Python tools + default UI ("auto" mode)

Two temperature converters in `py/mcp_driver.py`. No React needed — Playground
auto-generates a form because the manifest omits `resourceURI`.

```python
from smssutil import mcp_metadata
import json

@mcp_metadata({"execution": "auto", "displayLocation": "inline",
               "loadingMessage": "Converting temperature..."})
def fahrenheit_to_celsius(temperature_f: float) -> str:
    """Convert a temperature from Fahrenheit to Celsius."""
    celsius = (temperature_f - 32) * 5 / 9
    return json.dumps({"fahrenheit": temperature_f, "celsius": round(celsius, 2)})
```

Wiring notes:
- `py/mcp_driver.py` is the entry point SEMOSS looks for. Every tool needs `@mcp_metadata`.
- Type hints (`temperature_f: float`) become the required input schema. The function name
  is the title; the docstring is the description. Return a JSON string.
- The `mcp/py_mcp.json` entry mirrors this (`SMSS_MCP_EXECUTION: "auto"`, no `resourceURI`,
  `_type: "python"`). **Hand-edit it** to match — `RunMCPTool` reads it to dispatch.
- Calling from the frontend (if you need to, beyond LLM invocation):
  `actions.run('RunMCPTool(function=["fahrenheit_to_celsius"], paramValues=[{"temperature_f": 72}])')`.

## Choosing between the two patterns

- **Default UI (Example B):** simple input→output transforms. Fastest path, no React.
- **Custom UI (Example A):** rich interaction, review-before-send, visualizations,
  multi-step flows.

When building a real tool, replace the example reactor/component/Python functions and
their manifest entries — keep the *patterns*, not the weather/temperature content.
