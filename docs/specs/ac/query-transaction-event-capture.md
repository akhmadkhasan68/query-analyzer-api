# AC: Query Transaction Event Capture

## Context

The capture endpoint (`POST /v1/query-transaction-events/capture`) is the primary ingestion point for query events sent by SDK/agents installed in client applications. It validates the API key, determines severity, creates or updates query transactions via signature deduplication, persists the event, and sends Slack notifications. Authentication uses `ProjectApiKeyGuard` with `x-project-id` and `x-api-key` headers instead of JWT.

## Acceptance Criteria

### Authentication & Authorization

- [ ] Given a valid `x-api-key` and `x-project-id` header, when a capture request is sent, then the request is authenticated and processing begins
- [ ] Given the API key is provided via `Authorization: Bearer <key>` header instead of `x-api-key`, when a capture request is sent, then the request is authenticated successfully
- [ ] Given the `x-api-key` header is missing and no `Authorization: Bearer` header is present, when a capture request is sent, then the response is HTTP 403 Forbidden
- [ ] Given the `x-project-id` header is missing, when a capture request is sent, then the response is HTTP 403 Forbidden
- [ ] Given an invalid API key that does not match any key for the specified project, when a capture request is sent, then the response is HTTP 403 Forbidden
- [ ] Given a valid API key but mismatched `x-project-id` (key belongs to a different project), when a capture request is sent, then the response is HTTP 403 Forbidden
- [ ] Given a soft-deleted API key, when a capture request is sent with that key, then the response is HTTP 403 Forbidden because `validateKeyPlain` does not find the deleted key
- [ ] Given the `projectKey.projectId` is null or undefined after guard validation, when the capture service processes the request, then the response is HTTP 422 Unprocessable Entity with message "Project not found for the provided project key."

### Request Validation

- [ ] Given all required fields (`queryId`, `rawQuery`, `executionTimeMs`, `timestamp`, `contextType`, `environment`) are provided with valid values, when a capture request is sent, then the response is HTTP 201 Created with message "Event captured successfully" and `data: null`
- [ ] Given the `queryId` field is missing or not a valid UUID, when a capture request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `rawQuery` field is missing or empty, when a capture request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `executionTimeMs` field is missing or not a number, when a capture request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `timestamp` field is missing or not a valid ISO date string, when a capture request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `contextType` field is missing or empty, when a capture request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `environment` field is missing or empty, when a capture request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `parameters` field is not provided, when the event is processed, then `parameters` defaults to `{}` (empty object)
- [ ] Given the `stackTrace` field is not provided, when the event is processed, then `stackTrace` defaults to `[]` (empty array)
- [ ] Given the `applicationName` and `version` fields are not provided, when the event is processed, then they are stored as undefined/null without error

### Response & Queue Processing

- [ ] Given a valid capture request, when the controller processes it, then the response HTTP 201 is returned immediately before queue processing completes (non-blocking)
- [ ] Given a valid capture request, when the event is sent to queue, then it is enqueued as job `SendQueryTransactionEvent` in the `QueryTransactionEvent` queue
- [ ] Given the project referenced by the project key does not exist in the database, when the service attempts to load project details, then a NotFoundException is thrown

### Severity Determination - Default Thresholds

- [ ] Given no custom severity settings exist for the project and `executionTimeMs` is >= 2000, when the event is processed, then severity is set to `critical`
- [ ] Given no custom severity settings exist for the project and `executionTimeMs` is >= 1000 but < 2000, when the event is processed, then severity is set to `high`
- [ ] Given no custom severity settings exist for the project and `executionTimeMs` is >= 500 but < 1000, when the event is processed, then severity is set to `medium`
- [ ] Given no custom severity settings exist for the project and `executionTimeMs` is >= 0 but < 500, when the event is processed, then severity is set to `low`

### Severity Determination - Custom Thresholds

- [ ] Given the project has a custom severity setting with key `severity` containing thresholds `[{level: "critical", threshold: 5000}, {level: "high", threshold: 2000}, {level: "medium", threshold: 1000}, {level: "low", threshold: 0}]`, when `executionTimeMs` is 5000, then severity is set to `critical`
- [ ] Given the project has custom severity thresholds, when `executionTimeMs` is 3000, then severity is determined using the custom thresholds (e.g., `high` if custom high threshold is 2000)
- [ ] Given the project has a severity setting record but the `values` field is empty or parses to an empty array, when the event is processed, then default thresholds are used
- [ ] Given the project has no severity setting record at all, when the event is processed, then default thresholds are used
- [ ] Given the project has custom thresholds, when severity is evaluated, then thresholds are checked from highest to lowest (critical -> high -> medium -> low)

### Signature Generation & Deduplication

- [ ] Given a capture request with `rawQuery`, `environment`, and `stackTrace`, when the signature is generated, then it is a SHA-256 hash of `projectId|projectKeyId|environment|rawQuery|stackTrace1-stackTrace2`
- [ ] Given a capture request without `stackTrace` (empty array), when the signature is generated, then it is a SHA-256 hash of `projectId|projectKeyId|environment|rawQuery` (no stack trace component appended)
- [ ] Given stack trace items with leading/trailing whitespace, when the signature is generated, then each trace item is trimmed before joining with `-`

### New Transaction (No Existing Signature)

- [ ] Given no existing query transaction matches the generated signature, when the event is processed, then a new `QueryTransaction` is created with `status: OPEN` and `occurrenceCount: 1`
- [ ] Given no existing query transaction matches the signature, when a new transaction is created, then `totalExecutionTime`, `averageExecutionTime`, `maxExecutionTime`, and `minExecutionTime` are all set to the request's `executionTimeMs`
- [ ] Given a new transaction is created, when the event data is persisted, then `eventData.transaction` is linked to the newly created query transaction

### Existing Transaction (Signature Match - Occurrence Aggregation)

- [ ] Given an existing query transaction matches the generated signature, when the event is processed, then `occurrenceCount` is incremented by 1
- [ ] Given an existing query transaction with `totalExecutionTime: 3000` and `occurrenceCount: 2`, when a new event with `executionTimeMs: 1500` is captured, then `totalExecutionTime` becomes `4500` and `averageExecutionTime` becomes `1500` (4500 / 3)
- [ ] Given an existing query transaction with `maxExecutionTime: 2000`, when a new event with `executionTimeMs: 3000` is captured, then `maxExecutionTime` is updated to `3000` (Math.max)
- [ ] Given an existing query transaction with `maxExecutionTime: 2000`, when a new event with `executionTimeMs: 1000` is captured, then `maxExecutionTime` remains `2000`
- [ ] Given an existing query transaction with `minExecutionTime: 1000`, when a new event with `executionTimeMs: 500` is captured, then `minExecutionTime` is updated to `500` (Math.min)
- [ ] Given an existing query transaction with `minExecutionTime: 1000`, when a new event with `executionTimeMs: 1500` is captured, then `minExecutionTime` remains `1000`

### Event Data Persistence

- [ ] Given a valid capture request, when the event is saved, then it includes fields: `id` (UUID), `project`, `queryId`, `rawQuery`, `parameters`, `executionTimeMs`, `stackTraces`, `timestamp`, `receivedAt` (server time), `contextType`, `environment`, `applicationName`, `version`, `sourceApiKey` (masked key), `severity`
- [ ] Given a capture request with `executionPlan` provided, when the event is saved, then `executionPlan` includes `databaseProvider`, `planFormat` (contentType, fileExtension, description), and `content`
- [ ] Given a capture request without `executionPlan` (null or not provided), when the event is saved, then the `executionPlan` field is not set on the event data
- [ ] Given the event is saved, when checking the `sourceApiKey` field, then it contains the masked version of the API key (not the plain key)
- [ ] Given the event is saved, when checking the `receivedAt` field, then it is set to the server's current timestamp at processing time (not the client's `timestamp`)

### Slack Notification

- [ ] Given the project has associated Slack channels (`projectSlackChannels`), when the event is processed successfully, then a Slack notification is sent to all associated channels using the `queryTransactionEventAlert` template
- [ ] Given the project has no associated Slack channels, when the event is processed, then Slack notification is skipped without error
- [ ] Given the project has Slack channels but the Slack message service throws an error, when the notification is attempted, then the error is logged but the main capture process completes successfully (fire-and-forget)
- [ ] Given multiple Slack channels are associated with the project, when a notification is sent, then all channels receive the alert message

### Error Handling

- [ ] Given an error occurs during queue processing, when the error is caught, then it is logged and re-thrown for the queue handler to manage retries
- [ ] Given the project does not exist for the provided project key ID, when the service loads the project with relations, then a NotFoundException is thrown from `findOneOrFailByIdWithRelations`
