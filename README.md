# SEMOSS App Template

Starting point for building apps and MCP tools on the SEMOSS platform. Includes a React frontend, Java reactors, and Python tool support.

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

## Getting Started

1. **Create an app** in the SEMOSS UI → App page → "Create New App" → choose pro-code. Note the app ID from the URL.

2. **Clone this template** into your app's `assets` folder:
   ```
   cd workspace/Semoss/project/[YourApp]_[app-id]/app_root/version/
   mv assets old-assets
   git clone <repo-url> assets
   ```

3. **Install dependencies:**
   ```
   cd assets/client
   pnpm i
   ```

4. **Set your app ID** in `client/.env.local`:
   ```
   APP="your-app-id"
   ```

5. **Develop:**
   ```
   cd client
   pnpm dev     # Local dev server with hot reload
   pnpm build   # Production build → portals/
   ```

6. **Publish:** In the SEMOSS UI, open the editor → click "Publish files" to make changes visible to users.

## Key Concepts

- **Frontend** (`client/`): React app using `@semoss/sdk` to communicate with SEMOSS. Builds to `portals/`. See `client/README.md`.
- **Java Reactors** (`java/`): Backend logic compiled by SEMOSS into `classes/`. Click "Recompile reactors" in the SEMOSS UI after changes. See `java/README.md`.
- **Python Tools** (`py/`): Add MCP tools in `py/mcp_driver.py` with `@mcp_metadata` decorator. Simple tools can use Playground's default UI (no React needed) by omitting `resourceURI`.
- **MCP Manifests** (`mcp/`): Auto-generated. Run `MakePythonMCP()` or `MakePixelMCP(...)` to regenerate. Never edit manually.
- **Publishing**: The SEMOSS UI snapshots `portals/` to a public location. Build first, then publish.

## More Info

- `client/README.md` — Frontend setup, commands, shadcn/ui
- `java/README.md` — Java reactor development
- `AGENTS.md` — Conventions and rules for LLM agents working in this codebase

