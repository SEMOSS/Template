---
name: semoss-add-page
description: Use when adding or changing a frontend page, route, nav item, data table, form, or card - the route constant, Router.tsx handle.crumbs breadcrumbs, nav-items.ts, feature components folder, types, the data-fetching and error-surfacing patterns (runPixelQuery, usePixelQuery, DataTable server mode, AlertBlurb vs toast), and displaying dates and times (formatDate / formatDateTime). Do not use for backend-only work (semoss-add-reactor) or deploying (semoss-deploy).
---

# Adding a page or feature

## Steps

1. **Route constant** in `routes.constants.ts` (bare segment, no leading slash).
2. **Page** `pages/<Name>Page.tsx`: named export, wrapper `<div className="flex flex-col gap-4">`,
   header `<h1 className="font-semibold text-xl">` + `<p className="text-muted-foreground text-sm">`.
3. **Register it in `pages/Router.tsx`** under `AppLayout`, inside a pathless group route
   (mirror the nav group; a page that has no group, like Home, goes directly under `AppLayout` with
   just its own crumb), with `handle: { crumbs: () => [{ label, path? }] } satisfies
   RouteHandle`. A detail page is a **child** of its list route, so the breadcrumb trail builds
   itself from `useMatches()`. Never build crumbs from `pathname`. A route that must render with
   no sidebar/top bar (a Playground tool iframe) goes outside `AppLayout`.
4. **Nav item** in `components/base/nav-items.ts` if it's a top-level destination. Active state
   is an exact `pathname` match, so child routes don't highlight the parent.
5. **Feature components** in `components/<Name>Page/`, one exported component per file with
   `export interface <Component>Props`. Shared pieces go in `components/base/`. Check
   `components/base` and `components/ui` before writing any UI.
6. **Types** in `types/<name>.types.ts`, mirroring the reactor output (backend:
   `semoss-add-reactor`). Date fields are `IsoDate` (calendar date) or `IsoDateTime` (UTC
   instant) from `types/date.types.ts`.
7. **Fetch data** (below), then run `pnpm fix` and `pnpm typecheck`.

## Fetching data: which tool

| Need | Use |
|---|---|
| Read once when a component mounts / its inputs change | `usePixelQuery<T>(pixel \| null)` → `{status, data \| errorMessage}`. `null` holds off fetching. |
| Server-paged, sortable, filterable table | `<DataTable mode="server" title=… columns getData getRowId />` with `getData` in `useCallback` calling `runPixelQuery`. |
| Client-side table over data you already have | `<DataTable mode="client" columns data … />` |
| Imperative call (submit, button) | `runPixelQuery` inside `try/catch` |

Never `actions.run()` for reactor calls (it destroys the error message) and never a hand-rolled
`useEffect` + `useState` fetch. Build Pixel strings with `JSON.stringify` for every string/array
argument.

## Showing errors (no Retry buttons)

- **A page's or card's own load failed** → inline `AlertBlurb` (`color="danger"`, title says what
  failed, body is `state.errorMessage`). Empty / not found → `warning`.
- **Form submit failed** → pass `errorMessage` into the form (the form's save hook);
  `toast.success` on success.
- **Background / non-blocking failure** (lookups, summary data feeding several cards, logout)
  → `toast.error(message)`.
- An unexpected route-level failure is thrown to the router's `ErrorPage`.

## Showing dates

Render every date through `@/lib/date`, never by hand:

| Value | Helper | Output |
|---|---|---|
| `IsoDate` (`"2026-09-01"`, e.g. a due date) | `formatDate(value)` | `Sep 1, 2026`, never zone-converted |
| `IsoDateTime` (`"2026-09-01T14:30:00Z"`, e.g. created at) | `formatDateTime(value)` | `Sep 1, 2026, 10:30 AM EDT`, in the viewer's zone |

Both accept `null`/`undefined` and return "Not provided" (pass a second argument to change it),
so don't wrap them in `value ? … : "Not provided"`. In a `DataTable`, use a `getDisplay` renderer
that calls the helper. No `toLocaleDateString`, `new Date(...)`, or `Intl.DateTimeFormat` in
components; a calendar date run through `new Date(...)` shows the wrong day for US users. If
neither helper fits (relative time, a different layout), add a helper to `lib/date.ts`.

## DataTable rules

- `title` keys persisted sort/filter/pagination in localStorage; **it must be unique** and
  renaming it orphans saved state. Omit `title` for in-memory state only.
- `getData` must be `useCallback`-stable or the table refetches in a loop.
- A column `id`/`accessorKey` must equal the server's sort/filter field. Opt in to filtering with
  `meta.filterVariant: "text" | "select"` (+ `filterOptions`), or `"date"` (a calendar-date
  column) / `"datetime"` (an instant column, filtered by the viewer's local day); other columns
  aren't filterable.
- Text filter = substring match; `select` = exact match. Changing sort/filters resets to page 1.

## Conventions

One component per file; named exports; `interface` for shapes, `type` for unions; arrow
functions only; `async/await`; theme tokens (no hex), `cn()` for conditional classes; status
colors via the `color` prop of `Chip` / `AlertBlurb` / `StatCard` (`lib/accent-colors.ts`); dates
via `lib/date.ts`. Add missing shadcn primitives with
`cd client && pnpm dlx shadcn@latest add <name>`.
