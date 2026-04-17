# Test Scenarios: Project Setting Management

## Preconditions

- A project exists in the database with a known `projectId`
- A valid JWT token is available for an authenticated user with appropriate permissions (`PROJECT_SETTING.VIEW`, `PROJECT_SLACK_CHANNEL.CREATE`, `PROJECT_SETTING.DELETE`)
- The endpoints are available at `GET /v1/projects/:projectId/settings`, `POST /v1/projects/:projectId/settings`, `DELETE /v1/projects/:projectId/settings`

## Scenarios

### Scenario 1: Create Severity Setting - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/:projectId/settings` with `key: "severity"` and `values: [{"level": "critical", "threshold": 5000}, {"level": "high", "threshold": 2000}, {"level": "medium", "threshold": 1000}, {"level": "low", "threshold": 0}]` | Valid create request |
| 2 | Verify the response | Response is HTTP 201 with the created setting including parsed `values` array |
| 3 | Verify `values` serialization | `values` is serialized with `JSON.stringify()` before storage |

### Scenario 2: Upsert Existing Setting - Same Key Updates Instead of Creating Duplicate

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a severity setting with thresholds `[{"level": "critical", "threshold": 5000}, ...]` | Setting created |
| 2 | Send `POST /v1/projects/:projectId/settings` with the same `key: "severity"` but different `values: [{"level": "critical", "threshold": 10000}, {"level": "high", "threshold": 5000}, {"level": "medium", "threshold": 2000}, {"level": "low", "threshold": 0}]` | Same key, new values |
| 3 | Verify the response | Response is HTTP 201 with updated values (upsert behavior) |
| 4 | Send `GET /v1/projects/:projectId/settings?key=severity` | Retrieve severity settings |
| 5 | Verify only one setting with key `severity` exists | No duplicate records; the existing setting was updated |

### Scenario 3: Create Setting - New Key Creates New Record

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure no setting with key `severity` exists for the project | No existing severity setting |
| 2 | Send `POST /v1/projects/:projectId/settings` with `key: "severity"` and valid `values` | New setting request |
| 3 | Verify the response | Response is HTTP 201 with a newly created setting record |

### Scenario 4: Create Setting - Invalid Key Enum

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/:projectId/settings` with `key: "invalid_key"` | Key is not a valid enum value |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 5: Create Setting - Invalid projectId Format

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/not-a-uuid/settings` with valid body | Invalid UUID in path |
| 2 | Observe the response | Response is HTTP 400 Bad Request (from `ParseUUIDPipe`) |

### Scenario 6: Create Setting - Null Values Edge Case

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/:projectId/settings` with `key: "severity"` and `values: null` | Null values provided |
| 2 | Observe the behavior | `JSON.stringify` produces `"null"` which may cause parsing errors on retrieval |

### Scenario 7: Paginate Settings - Default Pagination

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects/:projectId/settings` with no query parameters | Default pagination |
| 2 | Verify the response | Response is HTTP 200 with defaults `page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC` |
| 3 | Verify each setting includes parsed values | Each setting includes `id`, `project`, `key`, and `values` (parsed from JSON string) |

### Scenario 8: Paginate Settings - Filter by Key

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects/:projectId/settings?key=severity` | Filter by key |
| 2 | Verify the response | Only settings with key `severity` are returned |

### Scenario 9: Paginate Settings - No JWT Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects/:projectId/settings` without a JWT token | No authentication |
| 2 | Observe the response | Response is HTTP 401 Unauthorized |

### Scenario 10: Delete Settings - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a severity setting for the project | Setting exists |
| 2 | Send `DELETE /v1/projects/:projectId/settings` with `ids` containing the setting ID | Valid delete request |
| 3 | Verify the response | Response is HTTP 200 with message "Project key deleted successfully" (known message oversight) |
| 4 | Verify the database | Record is permanently removed (hard delete, not soft delete) |

### Scenario 11: Delete Settings - IDs Not Found

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/projects/:projectId/settings` with `ids` containing non-existent UUIDs | Invalid IDs |
| 2 | Observe the response | Response is HTTP 404 Not Found with message "Data not found" |

### Scenario 12: Verify Impact on Capture - Custom Thresholds Used

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a severity setting with custom thresholds: `critical: 5000`, `high: 2000`, `medium: 1000`, `low: 0` | Custom thresholds configured |
| 2 | Send a capture event with `executionTimeMs: 3000` | Event is captured |
| 3 | Verify the event's severity | Severity is `high` (custom threshold: 2000 <= 3000 < 5000) |

### Scenario 13: Verify Impact on Capture - Deleted Setting Falls Back to Defaults

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a severity setting with custom thresholds | Custom setting exists |
| 2 | Delete the severity setting via `DELETE /v1/projects/:projectId/settings` | Setting is removed |
| 3 | Send a capture event with `executionTimeMs: 1500` | Event is captured |
| 4 | Verify the event's severity | Severity is `high` (default thresholds used: 1000 <= 1500 < 2000) |

### Scenario 14: Verify Impact on Capture - Empty Values Array Falls Back to Defaults

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a severity setting with `values: []` (empty array) | Setting exists but values are empty |
| 2 | Send a capture event with `executionTimeMs: 750` | Event is captured |
| 3 | Verify the event's severity | Severity is `medium` (default thresholds used: 500 <= 750 < 1000) |
