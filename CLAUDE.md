# SEMOSS App Template — Agent Guide

> **This is THE canonical SEMOSS app template.** It is built to be driven by coding
> agents. Read this file first; it is the single source of truth for how to build,
> wire, and ship a SEMOSS app. Deeper, task-specific guidance lives in the skills
> under `.claude/skills/` — load them when the task calls for it (see
> [Skills](#skills) below).

> **It is a template, so it ships with examples.** The weather tool
> (`GetWeatherReactor.java`, `ExampleComponent.tsx`) and the temperature converters
> (`py/mcp_driver.py`) are placeholders that demonstrate patterns. When asked to build
> new functionality, **replace these example files** — don't preserve or work around
> them.

---

## What this is — and who you're talking to

**SEMOSS is a platform for building and hosting apps that connect to your data and AI
models.** Some people build on it by writing code themselves; many don't have the skills
to, and work with an agent like you instead — if you're reading this, it's because a user
wants your help building their app. They're almost always talking to you from a coding
tool (Claude Code, VS Code with Copilot, or similar) rather than from inside the platform
itself, with the platform open separately in a browser. This repo is the **inner content
of one app**:
clicking "New app" on the platform gives someone an almost-empty shell, and the code here
is what gets dropped into it (via the sync script or a manual upload). The folder layout
is fixed because the platform looks in exact places: `portals/index.html` is the app that
renders, `java/` is compiled on the instance, `py/` holds Python tools, `mcp/` holds the
tool manifests.

An app can be **standalone** (its own page in the platform, reachable by a direct URL), a
**tool inside Playground** (the chat bundled with SEMOSS, where many people already do
their work), or **both** — but it always lives on the platform. A tool Playground calls is
itself an app hosted on the platform; there's no Playground tool that isn't an app. The
instance an app lives on is what compiles its Java backend and exposes it over an API, so
almost every app runs on one — and the same codebase often runs on several at once: you
might push to a local instance to test, preprod to share with others, and prod for your
users. (A pure-React-on-a-dev-server app, with no platform backend, is possible but
uncommon; assume the user is building on the platform unless they say otherwise.)

Two platform steps are easy to forget because they're separate from uploading: **Java must
be compiled** after it lands, and **frontend changes must be published** — the live files
in an app aren't the published snapshot until someone publishes. The sync script does both
(`CompileAppReactors`, then `PublishProject`); the platform UI also has a button for each.

Data and models come from the platform: models are usually shared to the user, vector
stores are cheap to create per use case, and databases can be connected or brought in. The
app just points at what SEMOSS already has.

### Talking to the user

Your audience is usually a **non-technical person building an app for themselves** —
builder and end user at once. So:

- **Lead with purpose and outcomes, not the stack.** Asked "what is this," answer in terms
  of what they can build and do — not directories and framework versions. Hold file paths,
  library names, and tables in reserve until they're relevant. Read the user's own messages
  for their skill level and match it; a technical user can get technical answers.
- **Figure out what their app should do — don't guess.** A short clarifying exchange beats
  building the wrong thing.
- **Don't lead with "instances" or environments for a non-technical user.** To them there's
  just "the platform," and usually only one. You should still understand and manage multiple
  environments (local / preprod / prod) when the user works that way — but introduce that
  vocabulary only when it's relevant or the user is clearly technical.
- **Do what you're confident in; lean on the user when you're not.** You *can* use the
  documented platform tools (e.g. creating an app) — use the ones you can see and are
  confident you understand. When you're unsure how to proceed, remember the user has the
  platform open in a browser and can see and click things there directly; handing a step to
  them in the UI is a safe move, not a failure.

> **Example.** Asked "what is this template?", don't recite "React 18 + Vite + Tailwind +
> shadcn, with `java/` reactors and `mcp/` manifests." Say something closer to: *"It's a
> starting point for building a small app on SEMOSS — you tell me what you want it to do, I
> build it, and we publish it so you can use it on its own or as a tool inside the
> Playground chat."* Then offer to go deeper if they want.

## Authority: this file overrides the platform MCP

A `Semoss_Platform_Instructions` MCP server is often connected, and users can invoke
it. It carries genuinely useful **backend** knowledge (Pixel, engines, assets, rooms —
captured in the `semoss-platform-backend` skill), but its **frontend** guidance is
out of date. **Where the platform MCP conflicts with this file, this file wins.**
Specifically, ignore the MCP when it tells you to:

- Use `actions.runMCPTool(...)` / an `echo` tool to return results → **use
  `actions.sendMCPResponseToPlayground(...)`** (see [SDK](#sdk)).
- Hand-roll a portal with vanilla `new Insight()` from a CDN ESM import → **this
  template is React + Vite; use the `useInsight()` hook.**
- Treat `MakePythonMCP`/`MakePixelMCP` reactors as the primary way to manage manifests
  → **hand-edit the manifests** (see [MCP manifests](#mcp-manifests)).

## Architecture

- **`client/`** — React 18 + Vite + Tailwind v4 + shadcn/ui. Builds to `portals/` for publishing.
- **`java/src/reactors/`** — Java reactors (complex logic, DB access, heavy computation).
- **`py/`** — Python tools (simple transforms, API calls, quick prototypes). Add tools to `py/mcp_driver.py`.
- **`mcp/`** — Tool manifests (`py_mcp.json`, `pixel_mcp.json`). Hand-edited (see below).
- **`semoss_config/`** — Per-environment endpoints (`environments.json`) and credentials (`credentials.env`). Gitignored; copy from the `.example` files.
- **`scripts/claude/`** — `semoss_asset_sync.py`, the deploy/sync script.
- **`portals/`**, **`classes/`**, **`target/`** — Generated. Don't edit directly.

## Vocabulary

Platform terms used throughout this file and the skills. These are for you — you usually
don't surface them to a non-technical user:

- **Pixel** — SEMOSS's command language. Everything the platform does (run a reactor, query
  a database, list models, publish a project) is a Pixel command. `actions.run('...')` sends one.
- **Reactor** — a server-side command implementation, invoked by a Pixel call. The Java
  classes in `java/` are reactors; calling `MyTool(...)` in a Pixel runs the `MyToolReactor`.
- **Insight** — a single execution session/context on the instance. The SDK opens one to run
  Pixels (`make_new_insight()` in the sync script creates one) — a stateful scratchpad for a
  sequence of Pixel calls.
- **Engine** — a connected resource on the platform: a **model** (LLM/embedding), a
  **database**, a **vector** store, or **storage**. Tools reference engines by ID.
- **Instance** — a running deployment of the SEMOSS platform (e.g. local, preprod, prod). An
  app's Java is compiled and served by the instance it lives on.

## SDK

The primary hook is `useInsight()` from `@semoss/sdk/react`:

- `actions.run()` — Execute any Pixel command (reactors, queries, etc.).
- `actions.sendMCPResponseToPlayground(response, status, executedParams)` — Return results to Playground chat (3 args). **This is the correct way to return tool results.**
- `isInitialized` — True when the SEMOSS SDK is ready. Gate rendering on it (see `InitializedLayout.tsx`).
- `tool` — MCP invocation context: `tool.parameters` (prepopulated inputs), `tool.tool_response` (past execution result), `tool.executedParameters` (past execution params).

### Calling tools from the frontend

Everything goes through `actions.run()`:

- **Java reactors:** `actions.run('YourTool(param=...)')` — drop the `Reactor` suffix from the class name.
- **Python MCP tools:** `actions.run('RunMCPTool(function=["tool_name"], paramValues=[{"param": "value"}])')` — calls the `RunMCPTool` Pixel reactor.
- **Escape params with `JSON.stringify()`:** `` actions.run(`Your(text=${JSON.stringify(userInput)})`) ``.
- **Check for errors:** `pixelReturn[0].operationType.includes("ERROR")`.
- **Return to Playground:** `actions.sendMCPResponseToPlayground(JSON.stringify(result), "success", { param })`.

### `actions.runMCPTool()` is deprecated

`actions.runMCPTool()` (SDK method) and `RunMCPTool()` (Pixel reactor) look similar but differ:

- **`actions.runMCPTool()`** — Deprecated SDK method. Calls Python tools but **also immediately sends the response to Playground**, which is usually unintended. Do not use it.
- **`RunMCPTool()`** — Normal Pixel reactor called via `actions.run()`. No auto-send. This is the correct way to call Python tools.

## Auth

The template ships native username/password auth, layered cleanly on top of the SDK:

- **`AuthProvider` / `useAuth()`** (`client/src/contexts/AuthContext.tsx`) — wraps the SDK auth surface. `useAuth()` exposes `login(username, password)`, `logout()`, `userLoginName`, and `isUserLoginLoading`. `AuthProvider` sits inside `InsightProvider` in `App.tsx`. **It is auth-only by design** — it does *not* wrap `runPixel`/`sendMCPResponseToPlayground`; call those via `useInsight()`/`actions.run()` as documented above.
- **`LoginPage`** (`pages/LoginPage.tsx`) — the login form, mounted at the `login` route *outside* the auth gate.
- **`AuthorizedLayout`** (`pages/layouts/AuthorizedLayout.tsx`) — route gate. Redirects logged-out users to `LoginPage`, stashing their intended path in location state so they're returned after login. Wrap protected routes with it in `Router.tsx`.
- Auth flows directly off the SDK: `useInsight().isAuthorized` is the source of truth; `actions.login({type:"native",...})` / `actions.logout()` do the work; `getSystemConfig()` yields the display name.

No logout button or nav bar ships by default — see the `semoss-user-menu` skill to add one.

## Multi-environment workflow

You will often target several backends (local, preprod, prod). **The agent owns
environment switching — the user just names the target.** Config lives in
`semoss_config/` (see the `semoss-deploy` skill for the full flow):

- `semoss_config/environments.json` — named envs, each with `base_url`, `api_module_url`, `web_module_url`, `app_id`.
- `semoss_config/credentials.env` — one key pair per env, prefixed by the uppercased env name (`LOCAL_ACCESS_KEY`/`LOCAL_SECRET_KEY`, `PROD_ACCESS_KEY`/…).

**Before every build, write `client/.env.local`** with the target env's values
(`APP=<app_id>`, `ENDPOINT=<base_url>`, `MODULE=<api_module_url>`). `client/.env` is a
committed dummy placeholder — never edit it; `.env.local` overrides it and is gitignored.

The sync script selects an env with `--env <name>`:
`python scripts/claude/semoss_asset_sync.py --env preprod bulk-upload portals py java mcp`.
Add `--no-verify-ssl` for self-signed preprod certs.

## Deploy

Three tiers, by capability — full detail in the `semoss-deploy` skill:

| Tier | Mechanism | When | Requires |
|------|-----------|------|----------|
| **Universal** | Manual UI zip | Always works. Build, then `zip -r bundle.zip portals py java mcp`, drag into the SEMOSS editor, check **unzip**, click **Compile and publish**. | Nothing (use `zip`, or Windows `tar.exe` — **not** PowerShell `Compress-Archive`) |
| **Iterate** | `scripts/claude/semoss_asset_sync.py bulk-upload` | Updating an app's code against a configured instance | Python + creds |
| **Submit** | `ai-repo` CLI | Submitting an app to the review pipeline | the CLI + login (see `semoss-ai-repo` skill) |

## MCP manifests

Tools are described by `mcp/py_mcp.json` (Python) and `mcp/pixel_mcp.json` (Java).
**Hand-edit these manifests directly** — it is the reliable, default path (see the
`semoss-mcp-manifest` skill for the schema and field reference).

The platform also exposes regenerator reactors, `MakePythonMCP()` and `MakePixelMCP()`,
which rebuild the manifests from source decorators/annotations. They are the "ideal" in
principle but are finicky in practice — reach for them only to troubleshoot a manifest
that hand-editing isn't getting right.

**MCP metadata options:** `resourceURI` (React route for custom UI — must match a route
in `Router.tsx`; omit for default UI), `execution` (`"ask"` / `"auto"` / `"disabled"`),
`loadingMessage` (shown during auto-execution), `displayLocation` (`"inline"` /
`"sidebar"` / `"none"`).

## Default UI vs custom UI

- **Default UI:** When a tool's `resourceURI` is missing/null, Playground auto-generates a form from the parameters. Best for simple input→output tools (e.g. temperature conversion). No React needed — the `py/mcp_driver.py` examples use this.
- **Custom UI:** When `resourceURI` points to a React route (e.g. `/#/`), Playground renders your app in an iframe. Use for rich interactions, visualizations, or multi-step flows. Routes **must** use the hash router (`/#/path`) — standard browser routing won't work in the iframe.

### Routing for custom-UI tools

`resourceURI` maps directly to a route in `client/src/pages/Router.tsx`. Be deliberate:

- **`/#/`** → root route. Use only if the app has a single custom-UI tool, or you intentionally share one UI.
- **`/#/tool-name`** → dedicated route. Use when multiple tools each need their own UI.

When adding a custom-UI tool, always do both: (1) add the route in `Router.tsx`, and
(2) set `resourceURI` in the manifest to match. Two tools sharing a `resourceURI` render
the same component — disambiguate via `tool.parameters` if you must.

**Standalone (non-tool) apps** are the same React app with no manifest wiring: add your
routes in `Router.tsx` and build the pages — there's no `mcp/*.json` entry and no
`resourceURI` to match. The MCP example (`ExampleComponent.tsx`) still demonstrates every
SDK pattern you need (`useInsight`, `actions.run`, init gating, auth); a standalone app
just calls those from its own pages and uses ordinary client-side state and navigation
instead of being invoked from Playground. No second example is needed — extrapolate from
the one that ships.

## Java reactor rules

- Extend `AbstractProjectReactor`. See `GetWeatherReactor.java` for a working example.
- `organizeKeys()` is called automatically by `preExecute()` — don't call it again in `doExecute()`.
- Define params via `keysToGet` and `keyRequired` arrays (`1` = required, `0` = optional).
- Return `new NounMetadata(responseMap, PixelDataType.MAP)` — SEMOSS handles serialization.
- Return errors via `NounMetadata.getErrorNounMessage("description")`.
- Implement `getDescriptionForKey()` and `getReactorDescription()` for manifest generation.
- `IModelEngine.ask()` returns response objects, not strings — use reflection to call `getResponse()`, never `toString()`.
- Resolve a model engine by ID: `IModelEngine modelEngine = Utility.getModel(modelId);` (import `prerna.util.Utility`) — returns `null` if not found.
- File paths: use `this.insight.getInsightFolder()`.

## Python MCP tool rules

- Define tools in `py/mcp_driver.py` — the entry point SEMOSS looks for.
- Every tool needs the `@mcp_metadata` decorator (from `smssutil`, auto-injected by SEMOSS): `@mcp_metadata({"execution": "auto"})`.
- Use type hints on all parameters — they become required MCP parameters.
- Tool title comes from the function name; description from the docstring.
- Return JSON strings.
- Omit `resourceURI` in `@mcp_metadata` for the default UI (recommended for simple tools).
- `ROOT` is injected by SEMOSS for file-path access.
- Use `ModelEngine` from `ai_server` for LLM calls; always accept `model_id` as a parameter.

## React UI rules

- Use `tool.parameters` for prepopulated values (**not** `tool.inputs`).
- Use `tool.tool_response` / `tool.executedParameters` to display past execution results.
- Handle responses that may be objects, strings, or double-encoded strings.
- Fetch models via: `actions.run('MyEngines(metaKeys=[], metaFilters=[{"tag":"text-generation"}], engineTypes=["MODEL"])')`.
- Call `sendMCPResponseToPlayground()` directly — don't wrap it. The SDK handles tool-name matching.
- Gate rendering on `isInitialized` (see `InitializedLayout.tsx`).
- Only a few shadcn/ui primitives ship (button, input, label, spinner, textarea). When you
  need more (Card, Select, Badge, Table, Dialog, …), **add them** — don't hand-roll:
  `cd client && pnpm dlx shadcn@latest add card select badge table`. They land in
  `client/src/components/ui/` configured against this template's theme.

## Development workflow

**The frontend runs locally but talks to a live instance for everything** — auth, Pixel
calls, models, data. `pnpm dev` is not self-contained: it serves the React app from your
machine while every `actions.run()` hits the `ENDPOINT` in `client/.env.local`. So you need
access to a running SEMOSS instance before any of this works; a missing or unreachable
endpoint shows up as an infinite spinner or a dead login. The app is gated behind login by
default — to iterate locally without typing credentials each time, set `ACCESS_KEY` and
`SECRET_KEY` in `client/.env.local` (a platform access/secret key pair) and the app
authenticates with them automatically.

1. `pnpm i` in **both** root and `client/`. (Skipping `client/` is the usual cause of a
   cryptic `biome: command not found` or missing-binary error.)
2. Write `client/.env.local` for the target env (see [Multi-environment workflow](#multi-environment-workflow)).
3. `pnpm dev` for development, `cd client && pnpm build` for production.
4. `pnpm fix` to format and lint (Biome) before committing.
5. Deploy via one of the three tiers above.

## Skills

Load these from `.claude/skills/` when the task calls for it:

| Skill | Use when |
|-------|----------|
| `semoss-database` | Querying a relational or graph database from a tool (`SqlQuery`, schema). |
| `semoss-model` | Calling an LLM / embedding model, or listing models the user can access. |
| `semoss-vector` | Querying a vector store, RAG retrieval, or managing embedded documents. |
| `semoss-deploy` | Publishing or updating an app — picking among the three deploy tiers, multi-env. |
| `semoss-mcp-manifest` | Writing or editing `mcp/*.json`, wiring `resourceURI`, execution modes. |
| `semoss-ai-repo` | Submitting an app to the review pipeline with the `ai-repo` CLI. |
| `semoss-platform-backend` | Deep platform/Pixel work: engine discovery, asset APIs, workspace/room control plane. |
| `semoss-testing-ci` | Adding JUnit/Mockito reactor tests, pre-commit hooks, or GitHub Actions CI (not shipped by default). |
| `semoss-user-menu` | Adding a top nav bar / user profile dropdown / logout button on top of the shipped auth (not shipped by default). |

## File pointers

| What | Where |
|------|-------|
| React entry | `client/src/index.tsx`, `client/src/App.tsx` |
| Routes | `client/src/pages/Router.tsx` |
| Auth context / hook | `client/src/contexts/AuthContext.tsx` (`AuthProvider`, `useAuth`) |
| Login page | `client/src/pages/LoginPage.tsx` |
| Auth route gate | `client/src/pages/layouts/AuthorizedLayout.tsx` |
| Route path constants | `client/src/routes.constants.ts` |
| Components | `client/src/components/` |
| Example MCP UI | `client/src/components/ExampleComponent.tsx` (**template — replace**) |
| Tailwind v4 theme | `client/src/index.css` |
| Vite config | `client/vite.config.ts` |
| shadcn/ui config | `client/components.json`, `client/tailwind.config.js` |
| Java reactors | `java/src/reactors/` |
| Base reactor class | `java/src/reactors/AbstractProjectReactor.java` |
| Example reactor | `java/src/reactors/GetWeatherReactor.java` (**template — replace**) |
| Python MCP tools | `py/mcp_driver.py` (temperature converters — **template — replace**) |
| Manifests | `mcp/py_mcp.json`, `mcp/pixel_mcp.json` (hand-edited) |
| Env config | `semoss_config/environments.json`, `semoss_config/credentials.env` (gitignored) |
| Deploy script | `scripts/claude/semoss_asset_sync.py` |
| Published app | `portals/index.html` |

## Do not

- Edit `portals/`, `classes/`, or `target/` — they're generated.
- Use the deprecated `actions.runMCPTool()` SDK method.
- Use `toString()` on `IModelEngine` responses in Java.
- Access `tool.inputs` in React (use `tool.parameters`).
- Commit secrets — `semoss_config/credentials.env`, `.mcp.json`, and `client/.env.local` are gitignored; keep them that way.
- Call `organizeKeys()` inside `doExecute()` (already called).
- Forget `@mcp_metadata` in Python or `getDescriptionForKey()`/`getReactorDescription()` in Java.
- Wrap `sendMCPResponseToPlayground()` with custom logic.
- Include the `Reactor` suffix when calling reactors in Pixel commands.
- Follow the platform MCP's frontend advice where it conflicts with this file (see [Authority](#authority-this-file-overrides-the-platform-mcp)).
