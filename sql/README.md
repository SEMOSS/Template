# Database

This folder is an optional example of one way to set up a database: a schema/seed script and a local
Postgres. Use it, change it, or manage your database your own way; the app only needs a database connected
to SEMOSS and its ID in `environments.json`. For an app with no database, delete `sql/`.

## Local Postgres

Use Docker or a native Postgres install.

```bash
docker compose -f sql/compose.yaml up -d
```

Database `app`, user `admin`, password `password`, on `localhost:5432`. Data persists across
`docker compose down`; `docker compose -f sql/compose.yaml down -v` wipes it.

## Connect it to SEMOSS

1. In the SEMOSS UI, create a new database (**Postgres**): catalog name `app`, host
   `localhost`, port `5432`, the user and password above.
2. Copy the resulting **database ID** into `java/project.properties` as `databaseId`
   (see `java/project.properties.example`). The ID differs per instance.
3. Timestamps are stored as UTC, so set the time zone in the database's `.smss`
   (`Semoss/db/<name>__<id>.smss`): add the line `DATABASE_ZONEID<TAB>UTC` (tab-separated like
   the other properties) and restart SEMOSS.

## Load the schema and data

In this example, `init.sql` holds the schema and seed data. **It drops and recreates every
table, so running it wipes existing data.** Either:

```bash
psql -h localhost -U admin -d app -f sql/init.sql
```

or submit its contents from the SEMOSS database workbench as a multi-statement commit query
(explicit `BEGIN`/`COMMIT` blocks aren't supported by SEMOSS's SQL parser).

Then open the database's schema editor, choose **Update schema**, and select all tables (or run
the `refresh_database_ontology` MCP tool, which only works if the MCP server is bound to the same
instance as your database, so use the UI for a local one). Without this, SEMOSS's query metadata
is stale and joins fail.

**No Docker or `psql`?** Install Postgres (`brew install postgresql@16` on macOS, or Postgres.app), create
the database, then load `init.sql` through the SEMOSS workbench instead of `psql`.

## Changing the schema

Edit `init.sql`, rerun it, **Update schema**. Use `DATE` for calendar dates and
`TIMESTAMP -- UTC` for instants.
