# AC: Project Setting Management

## Context

Endpoints for managing per-project configuration settings. Currently used primarily for configuring custom severity thresholds that affect how query transaction events are categorized by execution time. Settings use a key-value model where `values` is stored as a JSON string in the database (JSONB-like). The create endpoint performs upsert behavior -- one project can only have one setting per key.

## Acceptance Criteria

### Paginate Project Settings (`GET /v1/projects/:projectId/settings`)

- [ ] Given a valid JWT token with `PROJECT_SETTING.VIEW` permission and a valid `projectId`, when a paginate request is sent, then the response is HTTP 200 with paginated settings including `id`, `project`, `key`, and `values` (parsed from JSON string to object/array)
- [ ] Given default pagination parameters, when a paginate request is sent, then defaults are `page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC`
- [ ] Given a `key=severity` filter, when a paginate request is sent, then only settings with key `severity` are returned
- [ ] Given no `key` filter, when a paginate request is sent, then all settings for the project are returned
- [ ] Given no JWT token, when a paginate request is sent, then the response is HTTP 401 Unauthorized

### Create or Update (Upsert) Project Setting (`POST /v1/projects/:projectId/settings`)

- [ ] Given a valid JWT token with `PROJECT_SLACK_CHANNEL.CREATE` permission (as per current code), a valid `projectId`, and a request body with `key: "severity"` and `values` containing threshold array, when a create request is sent, then the response is HTTP 201 with the created setting including parsed `values`
- [ ] Given a project that already has a setting with key `severity`, when a second POST with the same key is sent, then the existing setting is updated (upsert behavior) rather than creating a duplicate
- [ ] Given the updated values for an existing severity setting, when the setting is saved, then `values` is serialized with `JSON.stringify()` before storage and deserialized with `JSON.parse()` on retrieval
- [ ] Given a project that does not have any setting with key `severity`, when a POST is sent, then a new setting record is created
- [ ] Given the `key` field is not a valid enum value (anything other than `severity`), when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `projectId` path parameter is not a valid UUID, when a create request is sent, then the response is HTTP 400 Bad Request (from `ParseUUIDPipe`)
- [ ] Given `values` is set to `null` or `undefined`, when the setting is saved, then `JSON.stringify` produces `"null"` or `"undefined"` which may cause parsing errors on retrieval
- [ ] Given valid severity values like `[{level: "critical", threshold: 5000}, {level: "high", threshold: 2000}, {level: "medium", threshold: 1000}, {level: "low", threshold: 0}]`, when saved, then these thresholds are used during event capture severity determination

### Delete Project Settings (`DELETE /v1/projects/:projectId/settings`)

- [ ] Given a valid JWT token with `PROJECT_SETTING.DELETE` permission and `ids` containing valid setting IDs, when a delete request is sent, then the response is HTTP 200 with message "Project key deleted successfully" (known message oversight in code)
- [ ] Given valid setting IDs, when deletion is processed, then a hard delete is performed (records are permanently removed, not soft-deleted)
- [ ] Given one or more `ids` that do not exist in the database, when a delete request is sent, then the response is HTTP 404 Not Found with message "Data not found"
- [ ] Given the severity setting that is actively used by the capture endpoint is deleted, when the next capture event is processed, then the system falls back to default severity thresholds (critical: 2000, high: 1000, medium: 500, low: 0)

### Impact on Event Capture

- [ ] Given a project has a custom severity setting, when the capture endpoint processes an event, then it uses the custom thresholds instead of defaults
- [ ] Given a project has a custom severity setting with an empty values array, when the capture endpoint processes an event, then it falls back to default thresholds
