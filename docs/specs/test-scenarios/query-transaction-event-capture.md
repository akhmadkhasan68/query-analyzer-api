# Test Scenarios: Query Transaction Event Capture

## Preconditions

- A project exists in the database with a known `projectId`
- An API key has been generated for the project (plain key is available)
- A platform is assigned to the project
- The capture endpoint is available at `POST /v1/query-transaction-events/capture`
- Slack channels may or may not be associated with the project depending on the scenario

## Scenarios

### Scenario 1: Happy Path - Capture a New Event Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set headers `x-project-id` to a valid project ID and `x-api-key` to the valid plain API key | Headers are set correctly |
| 2 | Send `POST /v1/query-transaction-events/capture` with body containing valid `queryId` (UUID), `rawQuery` ("SELECT * FROM users"), `executionTimeMs` (250), `timestamp` (ISO 8601), `contextType` ("HTTP"), `environment` ("production") | Response is HTTP 201 with `message: "Event captured successfully"` and `data: null` |
| 3 | Verify the event is enqueued as job `SendQueryTransactionEvent` in the `QueryTransactionEvent` queue | Job is present in the queue |
| 4 | Verify a new `QueryTransaction` is created with `status: OPEN`, `occurrenceCount: 1` | Transaction record exists with correct values |
| 5 | Verify `totalExecutionTime`, `averageExecutionTime`, `maxExecutionTime`, `minExecutionTime` are all set to 250 | Execution time fields match the request value |
| 6 | Verify the event record includes `receivedAt` set to server time (not client `timestamp`) | `receivedAt` is a server-side timestamp |
| 7 | Verify `sourceApiKey` in the event record is the masked version of the API key | Masked key format (first 4 + `****` + last 4) is stored |

### Scenario 2: Authentication via Authorization Bearer Header

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set header `x-project-id` to a valid project ID | Header is set |
| 2 | Set header `Authorization` to `Bearer <valid_plain_api_key>` (no `x-api-key` header) | Bearer header is set |
| 3 | Send `POST /v1/query-transaction-events/capture` with a valid body | Response is HTTP 201 with `message: "Event captured successfully"` |

### Scenario 3: Missing x-api-key and No Bearer Header

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set header `x-project-id` to a valid project ID but omit both `x-api-key` and `Authorization` headers | Only project ID header is present |
| 2 | Send `POST /v1/query-transaction-events/capture` with a valid body | Response is HTTP 403 Forbidden |

### Scenario 4: Missing x-project-id Header

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set header `x-api-key` to a valid key but omit `x-project-id` | Only API key header is present |
| 2 | Send `POST /v1/query-transaction-events/capture` with a valid body | Response is HTTP 403 Forbidden |

### Scenario 5: Invalid API Key

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set `x-project-id` to a valid project ID and `x-api-key` to `qm_live_invalidkey000000000000000000000000000000` | Headers are set with invalid key |
| 2 | Send `POST /v1/query-transaction-events/capture` with a valid body | Response is HTTP 403 Forbidden |

### Scenario 6: Valid API Key with Mismatched Project ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set `x-api-key` to a valid key belonging to Project A, but set `x-project-id` to Project B's ID | Headers are set with mismatched project |
| 2 | Send `POST /v1/query-transaction-events/capture` with a valid body | Response is HTTP 403 Forbidden |

### Scenario 7: Soft-Deleted API Key Rejected

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Soft-delete an existing API key via `DELETE /v1/projects/:projectId/keys` | Key is soft-deleted successfully |
| 2 | Send `POST /v1/query-transaction-events/capture` using the deleted key | Response is HTTP 403 Forbidden because `validateKeyPlain` does not find deleted keys |

### Scenario 8: Project Key with Null Project ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate a scenario where `projectKey.projectId` is null after guard validation | Guard passes but project ID is null |
| 2 | Send a capture request | Response is HTTP 422 Unprocessable Entity with message "Project not found for the provided project key." |

### Scenario 9: Missing Required Field - queryId

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a valid capture request but omit `queryId` from the body | `queryId` is missing |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 10: Invalid queryId Format (Not UUID)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request with `queryId: "not-a-uuid"` | Invalid UUID format |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 11: Missing Required Field - rawQuery

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request with `rawQuery` omitted or set to empty string | `rawQuery` is missing/empty |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 12: Missing Required Field - executionTimeMs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request with `executionTimeMs` omitted or set to a non-number value (e.g., `"fast"`) | `executionTimeMs` is invalid |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 13: Missing Required Field - timestamp

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request with `timestamp` omitted or set to `"not-a-date"` | `timestamp` is invalid |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 14: Missing Required Field - contextType

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request with `contextType` omitted or empty | `contextType` is missing |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 15: Missing Required Field - environment

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request with `environment` omitted or empty | `environment` is missing |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 16: Optional Fields Default Values

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a valid capture request omitting `parameters`, `stackTrace`, `applicationName`, and `version` | Optional fields are not provided |
| 2 | Verify the saved event record | `parameters` defaults to `{}`, `stackTrace` defaults to `[]`, `applicationName` and `version` are null |

### Scenario 17: Severity Bracket - Low (Default Thresholds)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure no custom severity settings exist for the project | Default thresholds apply |
| 2 | Send a capture request with `executionTimeMs: 200` | Response is HTTP 201 |
| 3 | Verify the event's severity | Severity is `low` (0 <= 200 < 500) |

### Scenario 18: Severity Bracket - Medium (Default Thresholds)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure no custom severity settings exist for the project | Default thresholds apply |
| 2 | Send a capture request with `executionTimeMs: 750` | Response is HTTP 201 |
| 3 | Verify the event's severity | Severity is `medium` (500 <= 750 < 1000) |

### Scenario 19: Severity Bracket - High (Default Thresholds)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure no custom severity settings exist for the project | Default thresholds apply |
| 2 | Send a capture request with `executionTimeMs: 1500` | Response is HTTP 201 |
| 3 | Verify the event's severity | Severity is `high` (1000 <= 1500 < 2000) |

### Scenario 20: Severity Bracket - Critical (Default Thresholds)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure no custom severity settings exist for the project | Default thresholds apply |
| 2 | Send a capture request with `executionTimeMs: 3000` | Response is HTTP 201 |
| 3 | Verify the event's severity | Severity is `critical` (>= 2000) |

### Scenario 21: Custom Severity Thresholds

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a project setting with `key: "severity"` and `values: [{"level": "critical", "threshold": 5000}, {"level": "high", "threshold": 2000}, {"level": "medium", "threshold": 1000}, {"level": "low", "threshold": 0}]` | Custom severity setting is saved |
| 2 | Send a capture request with `executionTimeMs: 5000` | Response is HTTP 201 |
| 3 | Verify the event's severity | Severity is `critical` (custom threshold >= 5000) |
| 4 | Send a capture request with `executionTimeMs: 3000` | Response is HTTP 201 |
| 5 | Verify the event's severity | Severity is `high` (custom threshold >= 2000) |
| 6 | Send a capture request with `executionTimeMs: 1500` | Response is HTTP 201 |
| 7 | Verify the event's severity | Severity is `medium` (custom threshold >= 1000) |
| 8 | Send a capture request with `executionTimeMs: 400` | Response is HTTP 201 |
| 9 | Verify the event's severity | Severity is `low` (custom threshold >= 0) |

### Scenario 22: Custom Severity Setting with Empty Values Falls Back to Defaults

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a project setting with `key: "severity"` and `values: []` (empty array) | Setting exists but values are empty |
| 2 | Send a capture request with `executionTimeMs: 1500` | Response is HTTP 201 |
| 3 | Verify the event's severity | Severity is `high` (default thresholds used: 1000 <= 1500 < 2000) |

### Scenario 23: Signature Generation with Stack Trace

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request with `rawQuery: "SELECT * FROM orders"`, `environment: "production"`, `stackTrace: ["at OrderService.find", "at OrderController.list"]` | Request is processed |
| 2 | Verify the generated signature | Signature is SHA-256 hash of `projectId|projectKeyId|production|SELECT * FROM orders|at OrderService.find-at OrderController.list` |

### Scenario 24: Signature Generation without Stack Trace

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request with `rawQuery: "SELECT * FROM orders"`, `environment: "production"`, `stackTrace: []` | Request is processed |
| 2 | Verify the generated signature | Signature is SHA-256 hash of `projectId|projectKeyId|production|SELECT * FROM orders` (no stack trace component) |

### Scenario 25: Signature Generation with Whitespace in Stack Trace

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request with `stackTrace: ["  at Service.method  ", "  at Controller.action  "]` | Stack trace items have leading/trailing whitespace |
| 2 | Verify the generated signature | Each trace item is trimmed before joining; signature uses `at Service.method-at Controller.action` |

### Scenario 26: Duplicate Signature Aggregation - Occurrence Count Increment

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request creating a new transaction (unique signature) with `executionTimeMs: 1000` | New transaction created with `occurrenceCount: 1` |
| 2 | Send a second capture request with the same `rawQuery`, `environment`, and `stackTrace` (same signature) with `executionTimeMs: 1500` | Existing transaction is found by signature match |
| 3 | Verify the transaction's `occurrenceCount` | `occurrenceCount` is incremented to 2 |

### Scenario 27: Duplicate Signature Aggregation - Average Recalculation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Existing transaction has `totalExecutionTime: 3000`, `occurrenceCount: 2` | Starting state is known |
| 2 | Send a capture request with matching signature and `executionTimeMs: 1500` | Event is captured |
| 3 | Verify `totalExecutionTime` | Updated to 4500 (3000 + 1500) |
| 4 | Verify `averageExecutionTime` | Updated to 1500 (4500 / 3) |
| 5 | Verify `occurrenceCount` | Updated to 3 |

### Scenario 28: Duplicate Signature Aggregation - Max Execution Time Updated

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Existing transaction has `maxExecutionTime: 2000` | Starting state is known |
| 2 | Send a capture request with matching signature and `executionTimeMs: 3000` | New value exceeds current max |
| 3 | Verify `maxExecutionTime` | Updated to 3000 (Math.max) |

### Scenario 29: Duplicate Signature Aggregation - Max Execution Time Not Updated

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Existing transaction has `maxExecutionTime: 2000` | Starting state is known |
| 2 | Send a capture request with matching signature and `executionTimeMs: 1000` | New value is less than current max |
| 3 | Verify `maxExecutionTime` | Remains 2000 |

### Scenario 30: Duplicate Signature Aggregation - Min Execution Time Updated

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Existing transaction has `minExecutionTime: 1000` | Starting state is known |
| 2 | Send a capture request with matching signature and `executionTimeMs: 500` | New value is less than current min |
| 3 | Verify `minExecutionTime` | Updated to 500 (Math.min) |

### Scenario 31: Duplicate Signature Aggregation - Min Execution Time Not Updated

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Existing transaction has `minExecutionTime: 1000` | Starting state is known |
| 2 | Send a capture request with matching signature and `executionTimeMs: 1500` | New value is greater than current min |
| 3 | Verify `minExecutionTime` | Remains 1000 |

### Scenario 32: Event with Execution Plan

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request with `executionPlan` containing `databaseProvider: "PostgreSQL"`, `planFormat: {"contentType": "application/json", "fileExtension": "json", "description": "JSON plan"}`, and `content: {"Plan": {...}}` | Request includes execution plan |
| 2 | Verify the saved event record | `executionPlan` field includes `databaseProvider`, `planFormat`, and `content` |

### Scenario 33: Event without Execution Plan

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a capture request without the `executionPlan` field (null or omitted) | No execution plan provided |
| 2 | Verify the saved event record | `executionPlan` field is not set on the event data |

### Scenario 34: Slack Notification Delivery to Associated Channels

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Associate two Slack channels with the project | Channels are linked |
| 2 | Send a valid capture request | Event is captured successfully |
| 3 | Verify Slack notifications | Notifications are sent to both channels using the `queryTransactionEventAlert` template |

### Scenario 35: No Slack Channels - Notification Skipped

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure the project has no associated Slack channels | No channels linked |
| 2 | Send a valid capture request | Event is captured successfully (HTTP 201) |
| 3 | Verify Slack notification behavior | Slack notification is skipped without error |

### Scenario 36: Slack Notification Failure Does Not Block Capture

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Associate a Slack channel with the project | Channel is linked |
| 2 | Simulate Slack message service throwing an error | Slack service will fail |
| 3 | Send a valid capture request | Event is captured successfully (HTTP 201); Slack error is logged but does not affect the response |

### Scenario 37: Non-Blocking Response - Immediate Return Before Queue Processing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a valid capture request | Request is received by the controller |
| 2 | Observe the response timing | HTTP 201 is returned immediately before queue processing completes |
| 3 | Verify the event is enqueued | Job `SendQueryTransactionEvent` is added to the `QueryTransactionEvent` queue for async processing |

### Scenario 38: Project Not Found for Project Key

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate a scenario where the project referenced by the project key no longer exists in the database | Project record is missing |
| 2 | Send a capture request with the valid API key | Queue processor attempts to load project details |
| 3 | Observe the error | `NotFoundException` is thrown from `findOneOrFailByIdWithRelations` |

### Scenario 39: Error During Queue Processing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate an error during the queue processing phase | Processing fails |
| 2 | Observe the error handling | Error is logged and re-thrown for the queue handler to manage retries |
