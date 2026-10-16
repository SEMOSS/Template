# SEMOSS App Template

The canonical, agent-first starting point for building apps on the SEMOSS platform: a React
frontend with an app shell, Java reactors, a database layer, and a one-command deploy, wired
for coding agents.

## Read this first

This template is optimized for Claude. The single source of truth — architecture, SDK
usage, deploy flow, conventions, and the full skills index — lives in
**[CLAUDE.md](CLAUDE.md)**. Agents and humans alike should start there; this README is
just a front door. Setting up a new copy? Follow [ONBOARDING.md](ONBOARDING.md).

## Layout at a glance

| Path | What |
|------|------|
| `client/` | React + Vite + Tailwind v4 + shadcn/ui frontend (app shell, `DataTable`, shared hooks) → builds to `portals/` |
| `java/src/reactors/` | Java reactors: Pixel entry points; `base/AbstractProjectReactor` is the base class |
| `java/src/{service,database,domain,util}/` | Validation and orchestration, all SQL (`PagedQuery`), records, shared helpers |
| `sql/` | `init.sql` (schema + seed) and `compose.yaml` (local Postgres) |
| `mcp/` | Tool manifests (empty unless the app is a Playground tool) |
| `semoss_config/` | Per-environment endpoints + credentials (gitignored; copy the `.example`s) |
| `scripts/claude/` | `semoss_asset_sync.py` (deploy) and `init_app.py` (one-time rename) |
| `.claude/skills/` | Task-specific guidance, loaded on demand |
| `portals/`, `classes/`, `target/` | Generated — don't edit |

The *notes* feature is a worked example of every pattern; copy it, then delete it (see
[CLAUDE.md](CLAUDE.md#deleting-the-example)).

## Task-specific guidance

Deeper playbooks live as skills under `.claude/skills/` and load automatically when a task
calls for them — adding endpoints and pages, databases, models, vectors, deploy, Playground
tools, MCP manifests, the `ai-repo` CLI, platform backend, and testing/CI setup. See the Skills
table in [CLAUDE.md](CLAUDE.md) for the index.
