# Java Reactors

Backend logic for this SEMOSS app. Reactors are Java classes that handle complex operations like database access, heavy computation, and LLM interactions.

## Structure

```
java/
├── src/
│   ├── reactors/
│   │   ├── AbstractProjectReactor.java   Base class for all reactors
│   │   └── GetWeatherReactor.java           Example reactor
│   └── util/
│       ├── Constants.java                Shared constants
│       ├── HelperMethods.java            Utility functions
│       └── ProjectProperties.java        Config loader
└── project.properties                    Project configuration
```

## Creating a Reactor

1. Create a new class in `src/reactors/` that extends `AbstractProjectReactor`
2. Define parameters in `keysToGet` (names) and `keyRequired` (1 = required, 0 = optional)
3. Implement `doExecute()` with your logic — do **not** call `organizeKeys()` (it runs automatically)
4. Implement `getDescriptionForKey()` and `getReactorDescription()` for MCP manifest generation
5. Return results via `new NounMetadata(responseMap, PixelDataType.MAP)`
6. Return errors via `NounMetadata.getErrorNounMessage("description")`

See `GetWeatherReactor.java` for a working example.

## Compiling

After making changes, click **"Recompile reactors"** in the SEMOSS UI editor. This compiles `.java` files into `classes/` and makes them available immediately.

## Generating MCP Manifests

To register a reactor as an MCP tool, run this Pixel command in the SEMOSS Playground:

```
MakePixelMCP(reactor=["ReactorName"], mcpMetadata=[...])
```

Drop the "Reactor" suffix from class names (e.g., `GetWeatherReactor` → `GetWeather`).

## Calling from Frontend

```js
actions.run('GetWeather(city="Boston")')
```

Drop the "Reactor" suffix. Parameters are passed inline in the Pixel command.

## Key Rules

- Extend `AbstractProjectReactor`, not other base classes
- `IModelEngine.ask()` returns response objects — use reflection to call `getResponse()`, never `toString()`
- File paths: use `this.insight.getInsightFolder()`
- Don't edit `classes/` directly — it's auto-generated from this folder
