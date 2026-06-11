# SEMOSS App Template

The canonical, agent-first starting point for building apps and MCP tools on the SEMOSS
platform — a React frontend, Java reactors, and Python tools, wired for coding agents.

## Read this first

This template is optimized for Claude. The single source of truth — architecture, SDK
usage, deploy flow, conventions, and the full skills index — lives in
**[CLAUDE.md](CLAUDE.md)**. Agents and humans alike should start there; this README is
just a front door.

## Layout at a glance

| Path | What |
|------|------|
| `client/` | React + Vite + Tailwind v4 + shadcn/ui frontend → builds to `portals/` |
| `java/src/reactors/` | Java reactors (complex logic, DB access, LLM calls) |
| `py/mcp_driver.py` | Python MCP tools |
| `mcp/` | Tool manifests (`py_mcp.json`, `pixel_mcp.json`) — hand-edited |
| `semoss_config/` | Per-environment endpoints + credentials (gitignored; copy the `.example`s) |
| `scripts/claude/` | `semoss_asset_sync.py` deploy script |
| `.claude/skills/` | Task-specific guidance, loaded on demand |
| `portals/`, `classes/`, `target/` | Generated — don't edit |

## Task-specific guidance

Deeper playbooks live as skills under `.claude/skills/` and load automatically when a task
calls for them — databases, models, vectors, deploy, MCP manifests, the `ai-repo` CLI,
platform backend, a worked example app, and testing/CI setup. See the Skills table in
[CLAUDE.md](CLAUDE.md) for the index.
