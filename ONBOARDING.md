# First-time setup

**Audience: you, the coding agent.** Someone just cloned this repo (or created an app from
the template) and pointed you here. They are likely **non-technical**: they may not know what
a terminal, an API key, or a database is. Walk them through getting their own working copy
running end to end, explaining each step in plain language and doing everything yourself that
you can, rather than handing them commands to type.

This file is for **first-time setup only**. Once the app works, switch to `AGENTS.md` for how
the app is built and how to change it.

> **Assumption:** a local SEMOSS platform instance is already running at
> `http://localhost:9090` (a Tomcat server on their machine hosting Monolith + SemossWeb, which
> also means a JDK is installed). That setup is out of scope here. For a remote instance, swap
> in its URL everywhere below and use that env's entry in `environments.json`.

## 1. Check prerequisites

If something's missing and it needs admin rights or is a runtime you shouldn't install
unattended, tell the user exactly what to do, then wait for them.

| Tool | Check | If missing |
|---|---|---|
| Node.js + pnpm | `node -v` / `pnpm -v` | Ask the user to install Node.js LTS from nodejs.org, then run `corepack enable` yourself. |
| Python 3.10+ | `python3 --version` | Ask the user to install it. Don't attempt this yourself. |
| PostgreSQL **or** Docker | `psql --version` / `docker --version` | Only if the app needs a database (step 5). Either works. |

Python is only needed for the deploy script. Install what it needs yourself:

```bash
python3 -m pip install --upgrade "ai-server-sdk>=0.0.30" requests
```

## 2. Install JS dependencies

```bash
pnpm i
cd client && pnpm i && cd ..
```

Skipping the `client/` install is the usual cause of `biome: command not found` later.

## 3. Name the app

Decide the app's name with the user, then rename the template once:

```bash
python3 scripts/init_app.py "Their App Name"
```

This sets the Maven artifact, the top-bar and browser-tab names, the localStorage prefix and the
local database name. Update `README.md` and the first lines of `AGENTS.md` for the app too.

## 4. Create their app on the platform and get an API key

They need their own app on the instance; never reuse someone else's `app_id`.

1. Have them open `http://localhost:9090/SemossWeb/packages/client/dist/#/app/new`, click
   **"Develop in Code"**, and name the app.
2. Ask them for the resulting **App ID** (the UUID in the URL once the app exists).
3. ```bash
   cp semoss_config/environments.json.example semoss_config/environments.json
   ```
   and set `envs.local.app_id`. Delete the `preprod`/`prod` entries unless they have those.
4. The deploy script authenticates with its own key pair. Have them open
   `http://localhost:9090/SemossWeb/packages/client/dist/#/settings/my-profile`, scroll to the
   bottom, click **"New Key"**, name it after the app, and give you the **access key** and
   **secret key**.
5. ```bash
   cp semoss_config/credentials.env.example semoss_config/credentials.env
   ```
   and set `LOCAL_ACCESS_KEY` / `LOCAL_SECRET_KEY` (uncomment the lines).

A key pair acts as the user who created it, and that user must be an owner of the app (the person
who created the app is). Reusing someone else's keys, or keys from a user who isn't an owner, fails
with an ownership error at the first upload.

**Do not** put these keys in `client/.env.local`. Its `ACCESS_KEY`/`SECRET_KEY` fields are for the
frontend to auto-authenticate, and combining them triggers a known bug in the SDK's CSRF handling.
These keys belong only in `semoss_config/credentials.env`.

## 5. Set up a database (skip if the app has none)

If the app has no database, delete `sql/`, `java/src/{service,database}/notes`,
`java/src/reactors/notes` and the notes pages and routes (see "Deleting the example" in
`AGENTS.md`), then go to step 6.

1. Get Postgres at `localhost:5432`: `docker compose -f sql/compose.yaml up -d` (database named
   after the app, user `admin`, password `password`), or a native install with a database of that
   name. (If neither Docker nor `psql` is available, install Postgres, e.g. `brew install postgresql@16`
   or Postgres.app, and use the SEMOSS workbench in step 5 instead of `psql`.)
2. Connect it to SEMOSS: open `http://localhost:9090/SemossWeb/packages/client/dist/#/database/new`,
   choose **Postgres**, catalog name = the database name, host `localhost`, port `5432`, and the
   username and password.
3. Ask for the resulting **Database ID** and set `envs.local.database_id` in
   `semoss_config/environments.json`. (`deploy` and `configure` write it into
   `java/project.properties` for you.)
4. Timestamps are stored as UTC: in `Semoss/db/<name>__<database id>.smss` add the line
   `DATABASE_ZONEID<TAB>UTC` (tab-separated like the other properties) and restart SEMOSS.
   See "Dates" in `AGENTS.md`.
5. Load the schema: open
   `http://localhost:9090/SemossWeb/packages/client/dist/#/database/<database id>/workbench` and
   submit `sql/init.sql` as a multi-statement commit query. **This drops and recreates every
   table**, so only do it on a database whose data they're happy to lose. (Scripted alternative:
   `SqlQuery(database="<id>", query=<init.sql text>, commit=true);`.)
6. In the database's schema editor choose **Update schema**, select all tables, and save.
   `init.sql` alone doesn't update SEMOSS's query metadata.

## 6. Deploy for the first time

```bash
python3 scripts/semoss_asset_sync.py --env local configure
python3 scripts/semoss_asset_sync.py --env local deploy --no-delete-existing
```

`deploy` writes `client/.env.local`, points `java/project.properties` at the env's database,
builds, uploads, compiles the Java, and publishes. The output should end with
`Compiled reactors for project '…'` followed by a published result. A Java compile error is printed
under "Compiling reactors" instead; fix it before continuing. (`configure` is only needed if
you'll also run `pnpm dev`; `deploy` does its own.)

Give them the app link to bookmark:

```
http://localhost:9090/SemossWeb/packages/client/dist/#/app/<their app_id>/edit
```

**Prefer this link over a local dev server** (`pnpm dev`): they shouldn't need a terminal open to
use the app. That means **you own redeploying** (`deploy --env local`; add `--no-compile` for a
frontend-only change) any time the code changes.

## 7. Verify

Have them open the link. They should see the login page, then the app. If they're stuck on
login, `app_id` or the endpoint in `client/.env.local` is probably wrong (rerun `configure`).
If pages show "No database configured", the `database_id` for that env is missing or the
database isn't connected.

## Ongoing

None of this repeats. Whenever you change code for them, redeploy so their link stays current.
