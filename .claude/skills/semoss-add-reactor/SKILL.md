---
name: semoss-add-reactor
description: Use when adding or changing a backend endpoint end to end - a new Java reactor with its repository, service, database query, frontend type, and call site. Covers the reactor/service/repository layering, AbstractProjectReactor, PagedQuery for sortable/filterable/paginated lists, AppException error handling, dates, schema changes in sql/init.sql, and compiling on the instance. Do not use for pure frontend work (semoss-add-page) or deploy mechanics (semoss-deploy).
---

# Adding a backend endpoint

**Copy the closest existing feature first** (CLAUDE.md has the table). Paged list:
`GetNotesReactor` → `NoteService.page` → `NoteRepository.page`. Detail with a not-found case:
`GetNoteReactor` → `NoteService.get`. Write: `AddNoteReactor` → `NoteService.add` →
`NoteRepository.add`. Everything lives under `java/src/`.

## Steps

1. **Schema (only if needed).** Edit `sql/init.sql` (it drops and recreates every table, so
   rerunning wipes data; tell the user). After running it, **Update schema** in the SEMOSS
   database editor (or the `refresh_database_ontology` MCP tool), otherwise joins fail on stale
   metadata even though the tables exist. Dates: `DATE` for a calendar date,
   `timestamp -- UTC` for an instant (see Dates below).
2. **Domain record (optional).** `domain/<area>/` record or enum with `toMap()`. A plain `Map`
   is fine for simple shapes.
3. **Repository method** in `database/<area>/<Area>Repository`. All SQL lives here.
   - Reads: build a SEMOSS `SelectQueryStruct`, columns as `table__column`, joins via
     `addRelation(..., "inner.join")`, run with `QueryExecutionUtility.flushRsToMap(engine, query)`.
     Aliases are camelCase because they become the JSON the frontend reads.
   - **Paged lists:** declare a `List<PagedQuery.Column>` (`text`, `number`, `bool`,
     `textArray`, `date`, `instant`; first column = default sort) and return `PagedQuery.page`'s
     `{rows, totalCount}`. Don't hand-roll limit/offset/sort/filter code.
   - Writes: `PreparedStatement` on the reactor's `connection`, one statement per write (a CTE
     if you need several effects). There are no transactions.
4. **Service** in `service/<area>/` when there is validation, orchestration, or response
   shaping. Throw `AppException(ErrorCode.X, "user-readable message")`. Map constraint
   violations (SQLState 23505 unique, 23503 foreign key) to `INVALID_INPUT`. Skip the service
   only for a trivial read that forwards to a repository.
5. **Reactor** in `reactors/<area>/<Name>Reactor`, extending `AbstractProjectReactor`:
   - constructor sets `keysToGet` and `keyRequired` (`1` required, `0` optional); key names are
     private `static final` constants, camelCase;
   - `doExecute()` reads `keyValue.get(...)` (`getList`/`getMap` for arrays/objects), builds the
     service from `requireDatabase()` and `connection`, returns
     `new NounMetadata(map, PixelDataType.MAP)`;
   - implement `getReactorDescription()` and `getDescriptionForKey()`;
   - no logic, no SQL, no own DB connection, and don't call `organizeKeys()`.
6. **Frontend type** in `client/src/types/<name>.types.ts` mirroring the output exactly (rows +
   `totalCount` for paged reactors). Type date fields as `IsoDate` / `IsoDateTime`.
7. **Call it** from the client with `runPixelQuery` / `usePixelQuery` (see `semoss-add-page`).
   The Pixel is the reactor name without `Reactor`: `GetNote(noteId=${JSON.stringify(id)});`.
   Wrap every string or array argument in `JSON.stringify`.
8. **Manifest (almost never).** `mcp/pixel_mcp.json` is only for exposing a reactor to
   Playground chat (`semoss-playground-tool`). The app itself doesn't need an entry.
9. **Deploy and read the compile output** (`semoss-deploy`). A compile error means the backend
   is stale even if the upload succeeded.

## Dates

Never return a raw SEMOSS date value or a `Timestamp`/`toString()` of one; the UI can't parse
it reliably. Calendar dates (`DATE` columns) go out as `"yyyy-MM-dd"`, instants (`timestamp`
columns, stored as UTC) as ISO-8601 UTC (`"2026-09-01T14:30:00Z"`).

- Paged lists: declare the column as `PagedQuery.Column.date(...)` or `.instant(...)`, not `.text`.
- Anything else (detail reads, services): convert with `util.DateFormats` (`isoDate`,
  `isoInstant`, or `localDate` for logic). Don't write another parser.
- Don't convert to a time zone on the backend. Zone conversion happens in the UI.
- Full convention (including the required `DATABASE_ZONEID=UTC`): "Dates" in `CLAUDE.md`.

## Errors

| `ErrorCode` | Use for |
|---|---|
| `NOT_FOUND` | The requested row doesn't exist. |
| `PERMISSION_DENIED` | The caller isn't allowed (e.g. a check in an overridden `preExecute()`). |
| `INVALID_INPUT` | Bad params, uniqueness/FK violations. |
| `INTERNAL_ERROR` | Anything unexpected. Non-`AppException` exceptions become this automatically. |

The message is shown to users verbatim in toasts and inline alerts. Only add an `ErrorCode` if
the frontend will branch on it.

## PagedQuery filter rules (the usual source of bugs)

- `id` must be a declared `Column` field; unknown ids are silently ignored.
- A **list** value is an exact `IN` match; a text **scalar** is `LIKE %v%`; a number/boolean
  scalar is `==`. To fetch one row by id, send `{id: "noteId", value: [noteId]}`.
- A non-numeric string against a number column becomes `INTERNAL_ERROR`.
- A `date` column takes one `yyyy-MM-dd`; an `instant` column takes `start/end` ISO-8601 instants.

## Naming

Reactors `Get/Add/Update<Thing>Reactor`; packages `reactors.<area>`, `service.<area>`,
`database.<area>`, `domain.<area>`; DB columns snake_case; query aliases and JSON camelCase.
