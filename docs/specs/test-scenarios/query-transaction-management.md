# Test Scenarios: Query Transaction Management

## Preconditions

- A project exists in the database with a known `projectId` and an assigned platform
- A valid JWT token is available for an authenticated user
- The endpoints are available at `POST /v1/query-transactions`, `GET /v1/query-transaction-events`, and `POST /v1/query-transaction-events/notify`
- Slack channels may or may not be associated with the project depending on the scenario

## Scenarios

### Scenario 1: Create Transaction - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate and obtain a valid JWT token | Token is available |
| 2 | Send `POST /v1/query-transactions` with valid body including `projectId`, `signature`, `environment`, `totalExecutionTime`, `averageExecutionTime`, `maxExecutionTime`, `minExecutionTime` | Response is HTTP 201 with created transaction data |
| 3 | Verify the response data | Transaction has `status: "open"`, `occurrenceCount: 1`, and `firstOccurrence` set to the server's current time |
| 4 | Verify the project is validated with platform relation | Project is loaded with `platform` relation during creation |

### Scenario 2: Create Transaction - Non-Existent Project ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/query-transactions` with a `projectId` that does not exist | Invalid project ID in body |
| 2 | Observe the response | Response is HTTP 404 Not Found |

### Scenario 3: Create Transaction - Signature Exceeds Max Length

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/query-transactions` with `signature` containing 2049 characters | Signature exceeds 2048 character limit |
| 2 | Observe the response | Response is HTTP 400 Bad Request (Zod validation failure) |

### Scenario 4: Create Transaction - Empty Signature

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/query-transactions` with `signature: ""` | Signature is empty (less than 1 character) |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 5: Create Transaction - Negative Execution Time

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/query-transactions` with `totalExecutionTime: -100` | Negative value provided |
| 2 | Observe the response | Response is HTTP 400 Bad Request (Zod `min(0)` validation) |

### Scenario 6: Create Transaction - Invalid Environment

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/query-transactions` with `environment: ""` (empty) | Environment is empty |
| 2 | Observe the response | Response is HTTP 400 Bad Request |
| 3 | Send with `environment` exceeding 100 characters | Environment exceeds max length |
| 4 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 7: Create Transaction - No JWT Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/query-transactions` without any JWT token | No authentication provided |
| 2 | Observe the response | Response is HTTP 401 Unauthorized |

### Scenario 8: Paginate Events - Default Pagination

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/query-transaction-events` with a valid JWT token and no query parameters | Default pagination applies |
| 2 | Verify the response | Response is HTTP 200 with `page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC` |
| 3 | Verify each event includes relations | Each event includes `project` with `platform`, `keys`, and `projectGitlab` relations |

### Scenario 9: Paginate Events - Custom Page and PerPage

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/query-transaction-events?page=2&perPage=5` with a valid JWT token | Custom pagination parameters |
| 2 | Verify the response | Response contains the second page with up to 5 items and correct `meta` values |

### Scenario 10: Paginate Events - Filter by Severity

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure events with different severities exist in the database | Multiple severity levels present |
| 2 | Send `GET /v1/query-transaction-events?severity=high` | Filter by severity |
| 3 | Verify the response | Only events with severity `high` are returned |

### Scenario 11: Paginate Events - Invalid Severity Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/query-transaction-events?severity=invalid_value` | Invalid enum value |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 12: Paginate Events - Search by Keyword

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure an event with `rawQuery` containing "SELECT" exists | Searchable event present |
| 2 | Send `GET /v1/query-transaction-events?search=SELECT` | Search keyword provided |
| 3 | Verify the response | Events matching the search keyword "SELECT" are returned |

### Scenario 13: Paginate Events - No JWT Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/query-transaction-events` without any JWT token | No authentication provided |
| 2 | Observe the response | Response is HTTP 401 Unauthorized |

### Scenario 14: Notify Events - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure events exist with associated projects that have Slack channels | Events and channels are configured |
| 2 | Send `POST /v1/query-transaction-events/notify` with `queryIds` referencing existing events | Valid notification request |
| 3 | Verify the response | Response is HTTP 201 with message "Notification process triggered" |
| 4 | Verify Slack notifications | Alerts are sent to all associated project channels using the `queryTransactionEventAlert` template |

### Scenario 15: Notify Events - Some IDs Not Found

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/query-transaction-events/notify` with `queryIds` where some IDs do not exist | Mix of valid and invalid IDs |
| 2 | Observe the response | Response is HTTP 404 Not Found with message listing the missing IDs (e.g., "Data with ids [uuid1, uuid2] not found") |

### Scenario 16: Notify Events - Empty queryIds Array

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/query-transaction-events/notify` with `queryIds: []` | Empty array |
| 2 | Observe the response | Response is HTTP 400 Bad Request (Zod `min(1)` validation) |

### Scenario 17: Notify Events - Project Has No Slack Channels

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure an event exists whose project has no associated Slack channels | No channels for this project |
| 2 | Send `POST /v1/query-transaction-events/notify` with that event's ID along with other valid IDs | Mixed channel availability |
| 3 | Verify behavior | The event without channels is skipped (no error); other events are still notified |

### Scenario 18: Notify Events - Slack Failure for One Event

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate Slack notification failure for one specific event | Slack service throws error for one event |
| 2 | Send `POST /v1/query-transaction-events/notify` with multiple `queryIds` | Notification request with multiple events |
| 3 | Verify behavior | Error is logged for the failing event; processing continues for remaining events |

### Scenario 19: Notify Events - Public Endpoint (No Auth Required)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/query-transaction-events/notify` without any authentication token | No JWT provided |
| 2 | Observe the response | Request is accepted because the endpoint is public (`@ExcludeGlobalGuard()`) |

### Scenario 20: Notify Events - Multi-Project Channel Isolation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create events from two different projects, each with their own Slack channels | Project A has Channel A, Project B has Channel B |
| 2 | Send `POST /v1/query-transaction-events/notify` with event IDs from both projects | Mixed project events |
| 3 | Verify Slack channel routing | Project A's event only triggers notification on Channel A; Project B's event only triggers on Channel B |
