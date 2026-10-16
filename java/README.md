# Java Reactors

Backend logic for this SEMOSS app: Java classes for DB access, heavy computation, and
LLM calls. For the reactor rules, how to expose a reactor as an MCP tool (hand-edit
`mcp/pixel_mcp.json`), and how to call reactors from the frontend, see [AGENTS.md](../AGENTS.md)
and the `semoss-add-reactor` and `semoss-mcp-manifest` skills.

```
java/
├── src/
│   ├── reactors/<area>/   Pixel entry points: parse params, call a service, return a map
│   ├── reactors/base/     AbstractProjectReactor (error handling, DB connection, helpers)
│   ├── service/<area>/    validation, orchestration, response shaping; throws AppException
│   ├── database/<area>/   repositories: all SQL; database/PagedQuery for sort/filter/paginate
│   ├── domain/<area>/     optional records/enums with toMap()
│   └── util/              AppException, ErrorCode, DateFormats, ProjectProperties
├── project.properties          (gitignored; copy from the .example)
└── project.properties.example
```

The layering is `reactor → service → repository`. Add feature-specific classes under the matching folders.
