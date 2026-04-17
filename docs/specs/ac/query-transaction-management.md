# AC: Query Transaction Management

## Context

Endpoints for managing query transactions and query transaction events. Includes manual transaction creation (`POST /v1/query-transactions`), paginated event listing with filters (`GET /v1/query-transaction-events`), and manual Slack notification trigger for specific events (`POST /v1/query-transaction-events/notify`).

## Acceptance Criteria

### Create Query Transaction (`POST /v1/query-transactions`)

- [ ] Given a valid JWT token and a valid request body with all required fields, when a create transaction request is sent, then the response is HTTP 201 with the created transaction data including `status: "open"`, `occurrenceCount: 1`, and `firstOccurrence` set to the server's current time
- [ ] Given a valid request body, when the transaction is created, then the project is validated by loading it with the `platform` relation
- [ ] Given a `projectId` that does not exist in the database, when a create transaction request is sent, then the response is HTTP 404 Not Found
- [ ] Given the `signature` field exceeds 2048 characters, when a create transaction request is sent, then the response is HTTP 400 Bad Request (Zod validation failure)
- [ ] Given the `signature` field is empty (less than 1 character), when a create transaction request is sent, then the response is HTTP 400 Bad Request
- [ ] Given any execution time field (`totalExecutionTime`, `averageExecutionTime`, `maxExecutionTime`, `minExecutionTime`) has a negative value, when a create transaction request is sent, then the response is HTTP 400 Bad Request (Zod `min(0)` validation)
- [ ] Given the `environment` field is empty or exceeds 100 characters, when a create transaction request is sent, then the response is HTTP 400 Bad Request
- [ ] Given no JWT token is provided, when a create transaction request is sent, then the response is HTTP 401 Unauthorized

### Paginate Query Transaction Events (`GET /v1/query-transaction-events`)

- [ ] Given a valid JWT token and no query parameters, when a paginate request is sent, then the response is HTTP 200 with default pagination: `page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC`
- [ ] Given a valid JWT token and `page=2&perPage=5`, when a paginate request is sent, then the response contains the second page with up to 5 items and correct `meta` values
- [ ] Given a valid JWT token and `severity=high`, when a paginate request is sent, then only events with severity `high` are returned
- [ ] Given a valid JWT token and `severity=invalid_value`, when a paginate request is sent, then the response is HTTP 400 Bad Request (not a valid enum value)
- [ ] Given a valid JWT token and `search=SELECT`, when a paginate request is sent, then events matching the search keyword are returned
- [ ] Given a valid JWT token, when events are returned, then each event includes `project` with relations (platform, keys, projectGitlab)
- [ ] Given no JWT token is provided, when a paginate request is sent, then the response is HTTP 401 Unauthorized

### Notify Events (`POST /v1/query-transaction-events/notify`)

- [ ] Given valid `queryIds` referencing existing events, when a notify request is sent, then the response is HTTP 201 with message "Notification process triggered" and Slack notifications are sent to all associated project channels
- [ ] Given `queryIds` where all events exist and their projects have Slack channels, when notifications are sent, then each event's alert is sent to the correct project's Slack channels using the `queryTransactionEventAlert` template
- [ ] Given `queryIds` where some IDs do not match any existing event, when a notify request is sent, then the response is HTTP 404 Not Found with message listing the missing IDs (e.g., "Data with ids [uuid1, uuid2] not found")
- [ ] Given `queryIds` is an empty array, when a notify request is sent, then the response is HTTP 400 Bad Request (Zod `min(1)` validation)
- [ ] Given valid `queryIds` but one event's project has no associated Slack channels, when notifications are processed, then that event is skipped (no error) and other events are still notified
- [ ] Given a Slack notification fails for one event, when the error occurs, then it is logged and processing continues for the remaining events
- [ ] Given the notify endpoint is called without any authentication token, when the request is received, then it is accepted because the endpoint is public (`@ExcludeGlobalGuard()`)
- [ ] Given events from multiple different projects, when notifications are sent, then Slack channels are correctly filtered per project (each event only triggers notifications on its own project's channels)
