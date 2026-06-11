# Client

React frontend for this SEMOSS app — Vite, Tailwind v4, shadcn/ui, talking to the
platform via `@semoss/sdk`. Builds to `../portals/`.

```bash
cd client
pnpm i
pnpm dev      # local dev server with hot reload
pnpm build    # production build → portals/
pnpm dlx shadcn@latest add [component]   # add a shadcn/ui component
```

Before any build, write `client/.env.local` for the target environment (`APP`,
`ENDPOINT`, `MODULE`) — see the **Multi-environment workflow** section of
[CLAUDE.md](../CLAUDE.md). `.env` is a committed placeholder; never edit it.

For the SDK hook (`useInsight()`), calling reactors and Python tools, returning results to
Playground, and the React UI rules, see [CLAUDE.md](../CLAUDE.md) and the `semoss-*`
skills.

```
client/
├── src/
│   ├── index.tsx / App.tsx   entry + SDK provider
│   ├── index.css             Tailwind v4 theme
│   ├── components/           shared + shadcn/ui primitives
│   ├── pages/                routes and layouts
│   └── lib/                  utilities
├── vite.config.ts
├── components.json           shadcn/ui CLI config
└── tsconfig.json
```
