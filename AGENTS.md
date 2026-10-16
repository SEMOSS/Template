# SEMOSS App Template — Agent Guide

> **This is THE canonical SEMOSS app template.** It is built to be driven by coding
> agents. Read this file first; it is the single source of truth for how to build,
> wire, and ship a SEMOSS app. Deeper, task-specific guidance lives in the skills
> under `.agents/skills/` — load them when the task calls for it (see
> [Skills](#skills) below). A brand-new person setting up their own copy should start
> with `ONBOARDING.md`.

> **Tool-agnostic layout.** This file (`AGENTS.md`) and the skills in `.agents/skills/` are
> plain markdown that any coding agent can use. Claude Code finds them through two small shims:
> `CLAUDE.md` (just `@AGENTS.md`) and a `.claude/skills` symlink to `.agents/skills`. If your
> tool doesn't auto-load skills, open the `SKILL.md` named in the [Skills](#skills) table when
> a task matches. `.mcp.json.example` lists the platform MCP servers in Claude Code's format;
> copy the entries into your tool's MCP config.

---

## First app-building conversation

Ask the user whether they want to keep the bundled Notes example as a reference or remove it. If they choose removal, run `pnpm remove:notes-example` from this app root before building their app. Do not ask again once they have answered.

## What this is — and who you're talking to

**SEMOSS is a platform for building and hosting apps that connect to your data and AI
models.** Some people build on it by writing code themselves; many don't have the skills
to, and work with an agent like you instead — if you're reading this, it's because a user
wants your help building their app. They're almost always talking to you from a coding
tool (Claude Code, Codex, Copilot, Cursor, or similar) rather than from inside the platform
itself, with the platform open separately in a browser. This repo is the **inner content
of one app**: clicking "New app" on the platform gives someone an almost-empty shell, and
the code here is what gets dropped into it (via the sync script or a manual upload). The
folder layout is fixed because the platform looks in exact places: `portals/index.html` is
the app that renders, `java/` is compiled on the instance, `py/` holds Python tools,
`mcp/` holds the tool manifests.

An app is **standalone** by default (its own page in the platform, reachable by a direct
URL). It can also be a **tool inside Playground** (the chat bundled with SEMOSS) — see the
`semoss-playground-tool` skill — but it always lives on the platform. The instance an app
lives on compiles its Java backend and exposes it over an API, and the same codebase often
runs on several instances at once: push to a local instance to test, preprod to share,
prod for users. (A pure-React-on-a-dev-server app with no platform backend is possible but
uncommon; assume the user is building on the platform unless they say otherwise.)

Two platform steps are easy to forget because they're separate from uploading: **Java must
be compiled** after it lands, and **frontend changes must be published**. The sync script
does both (`CompileAppReactors`, then `PublishProject`); the platform UI also has a button
for each.

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
  just "the platform," and usually only one. You should still manage multiple environments
  (local / preprod / prod) when the user works that way — but introduce that vocabulary only
  when it's relevant or the user is clearly technical.
- **Do what you're confident in; lean on the user when you're not.** Use the documented
  platform tools you can see and understand. When unsure how to proceed, remember the user
  has the platform open in a browser; handing a step to them in the UI is a safe move, not a
  failure.

> **Example.** Asked "what is this template?", don't recite "React + Vite + Tailwind +
> shadcn, with `java/` reactors and `mcp/` manifests." Say something closer to: *"It's a
> starting point for building a small app on SEMOSS — you tell me what you want it to do, I
> build it, and we publish it so you can use it on its own or as a tool inside the
> Playground chat."* Then offer to go deeper if they want.

## Authority: this file overrides the platform MCP

A `Semoss_Platform_Instructions` MCP server is often connected. It carries genuinely useful
**backend** knowledge (Pixel, engines, assets, rooms — captured in the
`semoss-platform-backend` skill), but its **frontend** guidance is out of date. **Where the
platform MCP conflicts with this file, this file wins.** Specifically, ignore it when it
tells you to:

- Use `actions.runMCPTool(...)` / an `echo` tool to return results → use
  `actions.sendMCPResponseToRoom(...)` (`semoss-playground-tool` skill).
- Hand-roll a portal with vanilla `new Insight()` from a CDN ESM import → this template is
  React + Vite; use the `useInsight()` hook.
- Treat `MakePythonMCP`/`MakePixelMCP` as the primary way to manage manifests → hand-edit
  the manifests (`semoss-mcp-manifest` skill).

## Vocabulary

Platform terms used throughout (for you; usually don't surface them to a non-technical user):

- **Pixel** — SEMOSS's command language. Everything the platform does is a Pixel command.
  The frontend sends one as a string, using `JSON.stringify` for values.
- **Reactor** — a server-side command implementation. A Java class ending in `Reactor` is invoked by its Pixel name. Drop the `Reactor` suffix when calling.
- **Insight** — a single execution session on the instance. The SDK opens one to run Pixels;
  `useInsight()` gives you its `insightId`.
- **Engine** — a connected resource on the platform: a **model** (LLM/embedding), a
  **database**, a **vector** store, or **storage**. Tools reference engines by ID.
- **Instance** — a running deployment of the platform (local, preprod, prod). An app's Java
  is compiled and served by the instance it lives on.

---

## Extending this codebase: copy what exists

Almost everything is one of a handful of patterns repeated. Extend it by finding the
closest existing feature and mirroring it, not by designing something new.

1. **Find the closest existing feature and read it end to end** before writing anything
   (reactor → service → repository → type → page/components). Use the table below.
2. **Mirror its structure exactly:** same folders, layering, naming, error handling. New
   files go next to their siblings (`components/<PageName>/`, `reactors/<area>/`,
   `service/<area>/`, `database/<area>/`).
3. **Reuse before you create.** Check `components/base`, `components/ui`, `hooks`, `lib`,
   and `database/PagedQuery` first. Missing a shadcn primitive? Add it with the CLI
   (`cd client && pnpm dlx shadcn@latest add <name>`), don't hand-roll one.
4. **Don't introduce new libraries, state management, data-fetching approaches, base
   classes, or abstractions.** If the existing pattern genuinely doesn't fit, stop and
   explain why before diverging.
5. **Copy the structure, not the defects.** If something looks wrong, flag it; don't
   silently replicate it and don't fold an unrelated cleanup into your change.

| To build… | Copy this |
|-----------|-----------|
| Showing a date or time in the UI | `formatDate` / `formatDateTime` in `lib/date.ts` |
| Returning a date from Java | `PagedQuery.Column.date` / `.instant`, or `util.DateFormats` |

Step-by-step versions are in the `semoss-add-reactor` and `semoss-add-page` skills.

## Repo map

| Path | What |
|------|------|
| `client/` | React + Vite + Tailwind v4 + shadcn/ui frontend. Builds to `portals/`. |
| `java/src/reactors/<area>/` | Reactors: Pixel entry points. Parse params, call a service, return a map. No logic. |
| `java/src/reactors/base/` | `AbstractProjectReactor`: error handling, DB connection, param helpers. |
| `java/src/service/<area>/` | Validation, orchestration, response shaping. Throws `AppException`. |
| `java/src/database/<area>/` | Repositories: all SQL. `database/PagedQuery` is the shared sort/filter/paginate adapter. |
| `java/src/domain/<area>/` | Optional records/enums with `toMap()`. |
| `java/src/util/` | `AppException`, `ErrorCode`, `DateFormats`, `ProjectProperties`, `Constants`, `HelperMethods`. |
| `sql/` | Optional local Postgres Compose file; manage your own schema as needed. |
| `mcp/` | Tool manifests; empty by default (Playground tools only). |
| `semoss_config/` | Per-environment endpoints + credentials (gitignored; copy the `.example`s). |
| `scripts/` | `semoss_asset_sync.py` (deploy) and `init_app.py` (one-time rename). |
| `portals/`, `classes/`, `target/` | Generated. Never edit. |

---

## Backend (Java)

### Layers

`reactor → service → repository`, with `domain` records where useful.

- **Reactor** (`reactors/<area>/<Name>Reactor`): extends `AbstractProjectReactor`. Declares
  `keysToGet`/`keyRequired` (`1` = required, `0` = optional), reads params from `keyValue`
  (`getList` / `getMap` for arrays/objects), builds a service from `requireDatabase()` and
  `connection`, returns `new NounMetadata(map, PixelDataType.MAP)`. Implements
  `getReactorDescription()` and `getDescriptionForKey()`. No logic, no SQL.
- **Service** (`service/<area>/`): validation, orchestration, response shaping, and turning
  DB failures into `AppException` (e.g. SQLState 23505/23503 → `INVALID_INPUT`). Skip it only
  for a trivial read that forwards to a repository.
- **Repository** (`database/<area>/`): all SQL. Reads use a SEMOSS `SelectQueryStruct` +
  `QueryExecutionUtility.flushRsToMap` with columns written `table__column` and camelCase
  aliases. Writes use a `PreparedStatement` on `connection`, one statement per write (use a
  CTE if you need several effects; there are no transactions).

### `AbstractProjectReactor`

Every reactor extends it. `execute()` runs `preExecute()` then `doExecute()`; any exception is
logged and returned as an `ERROR` pixel with payload `{code, message}`; the DB connection is
released in `finally`. `preExecute()` resolves `projectId`, loads `ProjectProperties`, opens
the database connection if `databaseId` is set, and calls `organizeKeys()` (don't call it
again in `doExecute()`).

Fields in `doExecute()`: `user`, `projectId`, `projectProperties`, `database` (null without a
database; use `requireDatabase()` when you need it), `connection` (for raw JDBC; never open
your own), `keyValue`, plus `getCurrentUsername()`, `getList()`, `getMap()`. Override
`preExecute()` (calling `super.preExecute()` first) to add resources, such as a second engine
or a per-user authorization check.

### Errors

Throw `new AppException(ErrorCode.X, "message")` from a service or reactor. `ErrorCode` is
`NOT_FOUND`, `PERMISSION_DENIED`, `INTERNAL_ERROR`, `INVALID_INPUT`; add a code only if the
frontend will branch on it. Any other exception becomes `INTERNAL_ERROR` with its message. The
message reaches the UI verbatim, so write it for a user. Don't use
`NounMetadata.getErrorNounMessage`.

### Paged lists (`PagedQuery`)

A repository declares a `List<Column>` (`text`, `number`, `bool`, `textArray`, `date`,
`instant`; the first column is the default sort). The reactor takes
`sortField, sortDirection, limit, offset, filters` and the result is `{rows, totalCount}`.
Filters are `[{id, value}]`: `id` must be a declared field (unknown ids are silently ignored);
a **list** value is an exact `IN` match for non-date columns, a text **scalar** is a
`LIKE %v%` substring match, and a number/boolean scalar is `==`. A `date` column takes one
`yyyy-MM-dd`; an `instant` column takes a UTC interval `start/end` of ISO-8601 instants (end
exclusive), which `DataTable` builds from the day the user picks in their zone. Date columns
reject list values and malformed input with `INVALID_INPUT`. `limit` is clamped to 1..500. A blank
`sortField` uses the default sort; an unknown one is `INVALID_INPUT`. Nulls sort first on `desc`
(database default). A non-numeric string on a number
column surfaces as `INTERNAL_ERROR`.

### Database

The app needs one relational database engine on the platform (`databaseId`); how you create and
manage its schema is up to you. Create and register the schema your app needs. After any schema change, however you make it, run **Update schema** in the SEMOSS database editor (or the
`refresh_database_ontology` MCP tool, if it's bound to the same instance as your database; use the
UI for a local one); SEMOSS query metadata doesn't follow DDL on its own and
stale metadata breaks joins. The `semoss-database` skill covers querying and the MCP helpers.
Snake_case tables and columns; camelCase aliases and JSON.

### Dates

Two kinds, handled differently end to end:

| Kind | Example | DB column | Wire format | UI helper |
|---|---|---|---|---|
| Calendar date (no time of day) | `due_date` | `DATE` | `"2026-09-01"` | `formatDate` |
| Instant (when something happened) | `created_at` | `timestamp`, **stored as UTC** | `"2026-09-01T14:30:00Z"` | `formatDateTime` |

- A calendar date is the same day for everyone: never zone-convert it. An instant is converted
  to the viewer's local zone, with the zone abbreviation, only in the UI.
- The database's `.smss` must set `DATABASE_ZONEID` to `UTC` (every environment). SEMOSS reads
  `timestamp` columns as wall-clock time in that zone; any other value shifts instants.
- Java: never serialize a raw SEMOSS value. Declare list columns as `Column.date` /
  `Column.instant`, or pass values through `util.DateFormats.isoDate` / `isoInstant` (and
  `localDate` for logic).
- UI: type fields as `IsoDate` / `IsoDateTime` (`@/types/date.types`) and render only through
  `@/lib/date`; no ad hoc `toLocaleDateString` / `new Date(...)`.
- New SQL columns: `DATE` for calendar dates, `timestamp -- UTC` for instants.

### Config: `java/project.properties`

Gitignored; create from `project.properties.example`. Keys: `databaseId` (the database engine
ID **on the instance you deploy to**; empty for an app with no database). It is uploaded with
`java/`, so deploying to instance X while it holds instance Y's ID silently points the app at
the wrong database. `deploy` and `configure` set it from `database_id` in
`environments.json`. `ProjectProperties` caches it, so a changed value needs a recompile. Add
a property by adding a field, getter, and read in `ProjectProperties.loadProp()`.

### Other reactor rules

- `IModelEngine.ask()` returns response objects, not strings — call `getResponse()` by
  reflection, never `toString()`. Resolve a model with `Utility.getModel(modelId)` (null if
  not found).
- **Persisting app data** (files, not the database): write under
  `Utility.normalizePath(AssetUtility.getProjectAssetsFolder(projectId) + "/data/yourfile.json")`
  with ordinary Java file I/O (`ProjectProperties.java` does this). `insight.getInsightFolder()`
  is for ephemeral, insight-scoped files only. **Keep persisted data in a directory you never
  bulk-upload (e.g. a top-level `data/`)**: re-uploading a synced dir overwrites remote files
  with the repo's copy and destroys live data (see `semoss-deploy`).
- **Available libraries:** the instance provides the platform classpath (`gson`, log4j,
  `prerna.util.*`, …). You won't get confirmation a less-common lib is available until it
  compiles on deploy.
- `mcp/pixel_mcp.json` exposes reactors as tools in Playground chat. The app's own frontend
  calls reactors by name and doesn't need an entry (`semoss-mcp-manifest`,
  `semoss-playground-tool` skills).

---

## Frontend (`client/`)

React 19 · Vite · Tailwind v4 · shadcn/ui · react-router v7 (**hash router**, required for
SEMOSS) · zustand · TanStack Table · sonner · `@semoss/sdk`. Biome lints/formats (`pnpm fix`).

### Structure

```
client/src/
  App.tsx            InsightProvider > AuthProvider > Router, plus <Toaster>
  app.config.ts      APP_NAME (shown in the top bar)
  pages/             one file per route; Router.tsx; layouts/ (Initialized, Authorized, App)
  components/
    base/            shared: DataTable, AlertBlurb, Chip, StatCard, nav, breadcrumbs, user menu
    ui/              shadcn primitives
    <PageName>/      components belonging to one page
  hooks/ lib/ contexts/ types/   see below
  routes.constants.ts   route path segments
```

### Routing, layout, auth

- `Router.tsx` is a `createHashRouter` tree: `InitializedLayout` (waits for the SDK, shows
  `ErrorPage` on failure) → `AuthorizedLayout` (login gate) → `AppLayout` (top bar, sidebar,
  breadcrumbs) → pathless group routes → pages. `login` sits outside the gate. A route that
  must render without the shell (a Playground tool iframe) goes under `AuthorizedLayout` but
  outside `AppLayout`.
- **Breadcrumbs** come from each route's `handle: { crumbs } satisfies RouteHandle`;
  `PageBreadcrumbs` flattens `useMatches()`. Nest detail routes under their list route so the
  trail builds itself. Path segments are constants in `routes.constants.ts`.
- **Nav**: `components/base/nav-items.ts`; active state is an exact `pathname` match.
- **Auth:** `AuthProvider` / `useAuth()` (`contexts/AuthContext.tsx`) wraps the SDK auth
  surface: `login(username, password)`, `logout()` (also clears persisted UI state),
  `userLoginName`, `isUserLoginLoading`. It is **auth-only by design**. `AuthorizedLayout`
  redirects logged-out users to `LoginPage`, stashing their target in location state. App-level
  authorization (an allow-list of users) is not built in: see the `semoss-app-users` skill rather
  than growing `AuthContext`.

**Previewing locally past the login gate.** The login page ships on purpose — don't remove
it. To render the UI locally, cheapest first: (1) set `ACCESS_KEY`/`SECRET_KEY` in
`client/.env.local` and the app authenticates automatically; (2) if the same instance is open
and logged in in your browser, the SDK shares that cookie; (3) last resort: temporarily
short-circuit the gate in `AuthorizedLayout` — scratch only, never commit or deploy it.

### Calling the backend

- **Always use `runPixelQuery` (`lib/pixel-query.ts`) or `usePixelQuery` (`hooks/`).** They
  wrap `runPixel` and throw `PixelQueryError` (`Error` with the reactor's real message and
  `code`). Do **not** use `actions.run()` for reactor calls: it collapses the `{code,
  message}` payload into `"[object Object]"` (fixed upstream in SEMOSS/semoss-ui#3674,
  pending an SDK release; re-check before changing this rule). The platform's own pixels
  (`SqlQuery`, `LLM`, `MyEngines`, … in the `semoss-database` / `semoss-model` / `semoss-vector`
  skills) return a plain-string error, so `actions.run()` is fine for those.
- `usePixelQuery<T>(pixel | null)` returns `{status: "loading"} | {status: "error",
  errorMessage} | {status: "success", data}`; `null` holds off fetching. Use it for reads in
  components. Imperative calls (submit, button): `runPixelQuery` in `try/catch`.
- `DataTable mode="server"` takes a `useCallback`-stable `getData({sortField, sortDirection,
  limit, offset, filters})` that calls `runPixelQuery` and returns `{rows, totalCount}`.
- Build Pixel strings with `JSON.stringify` for every string/array argument. Batch statements
  that are always needed together into one call. Type each result with an interface in
  `types/<name>.types.ts` that mirrors the reactor's output exactly.
- **Surfacing errors:** inline `AlertBlurb` (`danger` = failure, `warning` = empty/not found)
  for a page's or card's own load; an `errorMessage` prop for form submits;
  `toast.error` for background or non-blocking failures. No Retry buttons.

### State

- Local component state for most things. A zustand store (`stores/useXStore.ts`) for lookup
  data shared across pages, filled once by a loader component mounted in `AppLayout`.
- `useLocalStorageState(id, initial?)` mirrors `useState` into localStorage under the app's
  storage prefix; `logout()` clears all of it. An empty id means in-memory only. `DataTable`
  uses it for sort/filter/pagination, keyed by its `title` (**titles must be unique**;
  renaming one orphans saved state).

### Components worth knowing

`components/base`: `DataTable` (client or server mode; column `meta.filterVariant` of
`text | select | date | datetime`), `AlertBlurb`, `Chip`, `StatCard` (all take a semantic
`color`: `primary | info | success | warning | danger`, from `lib/accent-colors.ts`),
`PagePlaceholder`. `DataTable` gotchas: `getData` must be `useCallback`-stable or the table
refetches in a loop; a column `id` must equal the server's sort/filter field; changing sort or
filters resets to page 1.

### Theme

`src/index.css` holds the theme as CSS variables (shadcn tokens plus `--success`, `--warning`,
`--info`). A rebrand edits `:root` / `.dark` there; components use tokens (`bg-background`,
`text-muted-foreground`, `text-success`), never hex/rgb.

### Conventions

- One exported component per file; `export interface <Component>Props`; named exports only; no
  `React.FC`, no `export default`. Import from the barrels (`@/components`, `@/hooks`).
- `interface` for object shapes, `type` for unions. No `any`, no `as` to silence a type error.
- Arrow functions only (the one `function` use is the `useLocalStorageState` overloads).
  `async/await` with `try/catch`, not `.then()`.
- Dates: render only through `lib/date.ts`; see [Dates](#dates).
- Tailwind theme tokens only; `cn()` for conditional classes.
- Page header: `<h1 className="font-semibold text-xl">` + `text-muted-foreground text-sm`
  subtitle.
- shadcn files in `components/ui` and `hooks/use-mobile.tsx` are vendored and exempt from the
  above. Add more with `cd client && pnpm dlx shadcn@latest add <name>`.

---

## Development workflow

**The frontend runs locally but talks to a live instance for everything** — auth, Pixel
calls, models, data. `pnpm dev` serves the React app from your machine while every call hits
the `ENDPOINT` in `client/.env.local`, so you need a running SEMOSS instance; a missing or
unreachable endpoint shows up as an infinite spinner or a dead login.

1. `pnpm i` in **both** root and `client/` (skipping `client/` is the usual cause of a
   cryptic `biome: command not found`).
2. `python3 scripts/semoss_asset_sync.py --env <name> configure` writes
   `client/.env.local` and `java/project.properties` for that env.
3. `pnpm dev` for development; `pnpm --dir client build` for production.
4. Before committing: `pnpm fix` (Biome) and `pnpm typecheck` (`tsconfig` isn't strict; there
   are no automated tests or CI by default — see `semoss-testing-ci`).

## Multi-environment and deploy

You will often target several backends (local, preprod, prod). **The agent owns environment
switching — the user just names the target.** Config lives in `semoss_config/`:
`environments.json` (per env: `base_url`, `api_module_url`, `web_module_url`, `app_id`,
`database_id`) and `credentials.env` (one key pair per env, prefixed by the uppercased env
name). Both are gitignored; copy the `.example`s. `client/.env` is a committed dummy; never
edit it (`client/.env.local` overrides it).

**Deploy:** `python3 scripts/semoss_asset_sync.py --env <name> deploy` writes
`client/.env.local`, sets `databaseId`, builds, uploads, removes orphaned remote files,
compiles, publishes, and restores `java/project.properties`. **Read the "Compiling reactors"
output**: an error there means the backend is stale even though the upload "succeeded".

| Tier | Mechanism | When | Requires |
|------|-----------|------|----------|
| **Universal** | Manual UI zip | Always works. | `zip` (not PowerShell `Compress-Archive`) |
| **Iterate** | `semoss_asset_sync.py deploy` | Updating an app on a configured instance | Python + creds |
| **Submit** | `ai-repo` CLI | Submitting to the review pipeline | the CLI + login |

Full detail, flags, and failure modes: `semoss-deploy` skill.

## Skills

Load from `.agents/skills/` when the task calls for it:

| Skill | Use when |
|-------|----------|
| `semoss-add-reactor` | Adding or changing a backend endpoint end to end (repository, service, reactor, FE type). |
| `semoss-add-page` | Adding a page, route, nav item, table, or form. |
| `semoss-database` | Querying a relational or graph database from a tool (`SqlQuery`, schema). |
| `semoss-model` | Calling an LLM / embedding model, or listing models the user can access. |
| `semoss-vector` | Querying a vector store, RAG retrieval, or managing embedded documents. |
| `semoss-deploy` | Publishing or updating an app — deploy tiers, multi-env, failures. |
| `semoss-app-users` | Restricting the app to an allow-list of users (app-user table, server-side check, no-access page). |
| `semoss-playground-tool` | Making the app (or part of it) a tool inside Playground chat; Python tools. |
| `semoss-mcp-manifest` | Writing or editing `mcp/*.json`, wiring `resourceURI`, execution modes. |
| `semoss-ai-repo` | Submitting an app to the review pipeline with the `ai-repo` CLI. |
| `semoss-platform-backend` | Deep platform/Pixel work: engine discovery, asset APIs, workspace/room control plane. |
| `semoss-testing-ci` | Adding JUnit/Mockito reactor tests, pre-commit hooks, or GitHub Actions CI (not shipped by default). |

## Do not

- Edit `portals/`, `classes/`, or `target/` — they're generated.
- Use `actions.run()` for reactor calls (use `runPixelQuery` / `usePixelQuery`), or the
  deprecated `actions.runMCPTool()`.
- Add Retry buttons, new data-fetching patterns, new state libraries, or hand-rolled versions
  of components that exist in `components/base` or `components/ui`.
- Put logic or SQL in a reactor, open your own DB connection, or call `organizeKeys()` in
  `doExecute()`.
- Return errors with `NounMetadata.getErrorNounMessage`; throw `AppException`.
- Format dates by hand in the UI (`toLocaleDateString`, `new Date(...)`,
  `Intl.DateTimeFormat`) or return raw SEMOSS date values from Java. Don't zone-convert
  calendar dates or store non-UTC timestamps.
- Use `toString()` on `IModelEngine` responses, or include the `Reactor` suffix in a Pixel call.
- Deploy with `java/project.properties` pointing at a different environment's database (use
  `deploy`, which sets it).
- Commit secrets: `semoss_config/credentials.env`, `.mcp.json`, `java/project.properties` and
  `client/.env.local` are gitignored; keep them that way.
- Follow the platform MCP's frontend advice where it conflicts with this file.
