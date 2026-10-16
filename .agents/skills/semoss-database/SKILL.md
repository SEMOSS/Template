---
name: semoss-database
description: Use when writing code in an app that queries a relational or graph database on the platform, running SELECTs, inserts, updates, deletes, or fetching schema/table structure. Covers the SqlQuery(), SqlQueryBase64(), and GetDatabaseTableStructure() pixel commands via the Semoss SDK, plus listing databases with MyEngines(engineTypes=["DATABASE"]). Do not use for LLM calls (see semoss-model) or vector database queries (see semoss-vector).
---

# Database Engine

Query a database on the platform using `actions.run()` from the `useInsight()` hook with the `SqlQuery()` pixel command. `SqlQuery` auto-detects the SQL type and routes SELECTs through a `limit`-style path and inserts/updates/deletes through a `commit`-style path.

## Usage

```typescript
import { useInsight } from "@semoss/sdk/react";

const { actions } = useInsight();
const DATABASE_ID = "e188c7d8-076f-4847-967a-fff45f4ca355";
const sql = "SELECT CITY FROM SALES_DATA_SAMPLE WHERE SALES_DATA_SAMPLE.DEALSIZE = 'Small'";

const { pixelReturn } = await actions.run(
  `SqlQuery(database=${JSON.stringify(DATABASE_ID)}, query=${JSON.stringify(sql)}, limit=500);`,
);

if (pixelReturn[0].operationType.includes("ERROR")) {
  throw new Error(pixelReturn[0].output as string);
}

const { headers, values } = pixelReturn[0].output.data;
// headers: ["CITY"]
// values:  [["NYC"], ["Reims"], ["Lille"], ...]
```

> **Do not URL-encode the SQL.** The Pixel parser handles quotes, newlines,
> and other awkward characters for you. Interpolate `${sql}` plainly.
> Passing the SQL through `encodeURIComponent` produces literal escape
> sequences in the executed pixel, and the underlying database parser will
> reject the query as a SQL syntax error. If your SQL contains characters
> that still can't be carried cleanly, use `SqlQueryBase64` (below)
> instead.

The variations below show only the pixel string — the one that goes inside the `actions.run()` template literal. The surrounding `actions.run(...)` call, the error check, and the response parsing are the same as above.

### Insert / update / delete with SqlQuery

Pass `commit=true` instead of `limit`. `SqlQuery` auto-detects the SQL type, so the same pixel handles any modification statement.

```
SqlQuery(database="${DATABASE_ID}", query="UPDATE table_name SET column1 = value1 WHERE condition", commit=true);
```

### Base64-encoded queries

`SqlQueryBase64` has the same wrapper behavior as `SqlQuery`; only the query input format changes (base64-encoded UTF-8 SQL string). Useful when a SQL string contains characters that are awkward to escape in a pixel literal.

```
SqlQueryBase64(database="${DATABASE_ID}", query="U0VMRUNUICogRlJPTSB0YWJsZV9uYW1lOw==", limit=500);
```

`U0VMRUNUICogRlJPTSB0YWJsZV9uYW1lOw==` decodes to `SELECT * FROM table_name;`.

### Database structure

Fetch logical + physical metadata for every table/column (or vertex/property, for graph databases).

```
GetDatabaseTableStructure(database="${DATABASE_ID}");
```

Each row in `output.data.values` is a 6-tuple:

1. Logical table name (RDBMS) or vertex name (graph)
2. Logical column name (RDBMS) or property name (graph)
3. Data type of the column/property
4. Whether this row represents a graph vertex itself rather than a property on it (only meaningful for RDF/graph databases)
5. Physical column/property name as stored in the database
6. Physical table/vertex name as stored in the database

## Response shape

`pixelReturn[0].output` contains:
- `data.values` — 2D array of rows; each row is a tuple whose cells align with `data.headers`
- `data.headers` — display column names (aliased where the query aliased them)
- `data.rawHeaders` — raw underlying column names
- `headerInfo[]` — per-column metadata `{ dataType, alias, header, type, derived }`
- `sources[]` — engines that served the query: `{ name, type }`
- `numCollected` — number of rows actually returned (bounded by `limit`)

For the full response schema, see `references/response-schema.md`.

## Listing available databases

Before running a query, you often need to let the user pick a database — or find one programmatically. Use the `MyEngines` pixel with `engineTypes=["DATABASE"]` to list databases the current user has access to.

```typescript
import { useInsight } from "@semoss/sdk/react";

const { actions } = useInsight();

const { pixelReturn } = await actions.run(
  `MyEngines(engineTypes=["DATABASE"], limit=[50], offset=[0]);`
);

if (pixelReturn[0].operationType.includes("ERROR")) {
  throw new Error(pixelReturn[0].output as string);
}

const databases = pixelReturn[0].output as Array<{
  engine_id: string;
  engine_name: string;
  engine_display_name: string;
  engine_subtype: string;   // e.g. "H2_DB", "POSTGRES", "MYSQL", "TINKER"
  engine_cost: string;
  engine_favorite: 0 | 1;
}>;
```

### Filtering and paging

`MyEngines` accepts several optional arguments. All are arrays, even when passing a single value:

- `filterWord=["sales"]` — substring match against engine name.
- `limit=[50]`, `offset=[0]` — paging. Omit both to return all results.
- `onlyFavorites=[true]` — restrict to the user's favorited engines.
- `sort={"ENGINENAME": "ASC"}` — sort by `ENGINENAME` or `DATECREATED`, direction `ASC` or `DESC`.

```
MyEngines(engineTypes=["DATABASE"], filterWord=["sales"], sort={"ENGINENAME": "ASC"}, limit=[20], offset=[0]);
```

### Response field conventions

Use `engine_*` fields (`engine_id`, `engine_name`, `engine_display_name`, `engine_subtype`, etc.). The response also contains `app_*` and `database_*` fields with the same values — these are legacy aliases and should not be used in new code.

Common pattern — render a picker and use the selected `engine_id` as `DATABASE_ID` in the `SqlQuery()` call above:

```typescript
const [databases, setDatabases] = useState<Database[]>([]);
const [selectedId, setSelectedId] = useState<string>("");

useEffect(() => {
  actions.run(`MyEngines(engineTypes=["DATABASE"], limit=[50], offset=[0]);`)
    .then(({ pixelReturn }) => setDatabases(pixelReturn[0].output));
}, [actions]);
```

# Database query response schema

Full response shape returned from a `runPixel` call that wraps a `SqlQuery()` or `SqlQueryBase64()` command. The top-level response is an envelope; the tabular result lives at `pixelReturn[0].output.data`.

## Example response

```json
{
    "insightID": "019dba7a-fe47-7832-a745-ffc5af0971d7",
    "pixelReturn": [
        {
            "pixelId": "0",
          "pixelExpression": "SqlQuery ( database = [ \"e188c7d8-076f-4847-967a-fff45f4ca355\" ] , query = [ \"SELECT CITY FROM SALES_DATA_SAMPLE WHERE SALES_DATA_SAMPLE.DEALSIZE = 'Small';\" ] , commit = [ true ] ) ;",
            "isMeta": false,
            "timeToRun": 30,
            "output": {
                "data": {
                    "values": [
                        ["NYC"],
                        ["Reims"],
                        ["Lille"],
                        ["San_Francisco"]
                    ],
                    "headers": ["CITY"],
                    "rawHeaders": ["CITY"]
                },
                "headerInfo": [
                    {
                        "dataType": "STRING",
                        "alias": "CITY",
                        "header": "CITY",
                        "type": "STRING",
                        "derived": false
                    }
                ],
                "sources": [
                    {
                        "name": "e188c7d8-076f-4847-967a-fff45f4ca355",
                        "type": "RAW_ENGINE_QUERY"
                    }
                ],
                "numCollected": 50,
                "taskId": "null"
            },
            "operationType": ["OPERATION"]
        }
    ]
}
```

## Envelope fields

- `insightID` — The insight ID used for the pixel execution.
- `pixelReturn[]` — array of results, one per pixel command in the call. For a single query pixel, always index `[0]`.

## pixelReturn[0] fields

- `pixelId` — sequence ID of the command within the call.
- `pixelExpression` — the parsed pixel string SEMOSS actually executed. Useful for debugging encoding issues.
- `isMeta` — internal flag; ignore for query responses.
- `timeToRun` — execution time in milliseconds.
- `operationType` — categorization of the pixel; `["OPERATION"]` for database queries.

## pixelReturn[0].output fields — the query response

- `data.values` *(array of arrays)* — rows returned by the query. Each row is a tuple whose cells align positionally with `data.headers`. **Use this as the primary payload.**
- `data.headers` *(string[])* — display column names. Aliased where the query aliased them.
- `data.rawHeaders` *(string[])* — raw underlying column names as reported by the engine (before any aliasing).
- `headerInfo[]` — per-column metadata, one entry per column, each `{ dataType, alias, header, type, derived }`. `dataType` / `type` values include `"STRING"`, `"NUMBER"`, `"DATE"`, etc. `derived` is `true` for columns produced by a SEMOSS transform rather than the underlying SQL.
- `sources[]` — `{ name, type }` identifying the engine(s) queried. `name` is the database engine ID; `type` is typically `"RAW_ENGINE_QUERY"`.
- `numCollected` *(number)* — number of rows actually returned, bounded by the `limit` argument.
- `taskId` *(string | "null")* — background-task ID when the query streamed; the literal string `"null"` for synchronous returns.

## Variant: `GetDatabaseTableStructure`

The envelope and `output.data.values` / `output.data.headers` shape is identical, but each row is a schema-metadata tuple rather than application data:

```
[logicalTable, logicalColumn, dataType, isVertex, physicalColumn, physicalTable]
```

See the `### Database structure` section of `SKILL.md` for how to interpret each column.

## Variant: modification queries (`commit=true`)

INSERT / UPDATE / DELETE queries return the same envelope, but the `output` body typically carries a status / affected-row payload rather than a tabular `data.values`. Check `numCollected` and the top-level `errors` array from `runPixel` rather than assuming a rows-and-headers response.

## Common access patterns

```typescript
// Raw rows as array-of-arrays
const rows = pixelReturn[0].output.data.values;

// Map rows to objects keyed by header
const { headers, values } = pixelReturn[0].output.data;
const records = values.map(
  (row) => Object.fromEntries(headers.map((h, i) => [h, row[i]])),
);

// Inspect a column's type
const cityType = pixelReturn[0].output.headerInfo.find(
  (h) => h.header === "CITY",
)?.dataType;

// Row count (bounded by limit)
const { numCollected } = pixelReturn[0].output;
```
