# Database

This folder contains an optional local Postgres Compose file. Connect a database to SEMOSS and set its ID in `semoss_config/environments.json` if your app needs one. Create and register your own schema before querying it.

Run `docker compose -f sql/compose.yaml up -d` for a local Postgres instance. No database or table is dropped by the example removal command.
