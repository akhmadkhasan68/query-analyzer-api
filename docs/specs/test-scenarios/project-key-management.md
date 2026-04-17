# Test Scenarios: Project Key Management

## Preconditions

- A project exists in the database with a known `projectId`
- A valid JWT token is available for an authenticated user with appropriate permissions (`PROJECT.VIEW`, `PROJECT_KEY.CREATE`, `PROJECT_KEY.DELETE`)
- The endpoints are available at `GET /v1/projects/:projectId/keys`, `POST /v1/projects/:projectId/keys`, `DELETE /v1/projects/:projectId/keys`

## Scenarios

### Scenario 1: Generate Key - Plain Key Returned Once

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/:projectId/keys` with `name: "Production Key"` | Valid create request |
| 2 | Verify the response | Response is HTTP 201 with `id`, `name`, `maskedKey`, and `plainKey` |
| 3 | Verify `plainKey` format | Starts with `qm_live_` followed by 48 hex characters (total 56 characters) |
| 4 | Verify `maskedKey` format | Shows first 4 characters + `****` + last 4 characters (e.g., `qm_l****e5f6`) |
| 5 | Verify the database | Only the bcrypt-hashed version of the key is stored (not the plain key) |

### Scenario 2: Plain Key Cannot Be Retrieved After Creation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a key via `POST /v1/projects/:projectId/keys` and note the `plainKey` | Key created with `plainKey` visible |
| 2 | Send `GET /v1/projects/:projectId/keys` to list all keys | Paginate keys |
| 3 | Find the newly created key in the list | Key is found in results |
| 4 | Verify the key data | `plainKey` is NOT included in the response; only `maskedKey` is shown |

### Scenario 3: List Keys - Default Pagination with Masked Keys

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects/:projectId/keys` with no query parameters | Default pagination |
| 2 | Verify the response | Response is HTTP 200 with paginated keys, defaults `page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC` |
| 3 | Verify each key in the response | Each key shows `id`, `name`, `maskedKey`, and `lastUsedAt`; `plainKey` is never included |

### Scenario 4: List Keys - Search Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create keys with names "Production Key" and "Staging Key" | Two keys exist |
| 2 | Send `GET /v1/projects/:projectId/keys?search=Production` | Search filter applied |
| 3 | Verify the response | Only "Production Key" is returned |

### Scenario 5: List Keys - No JWT Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects/:projectId/keys` without a JWT token | No authentication |
| 2 | Observe the response | Response is HTTP 401 Unauthorized |

### Scenario 6: Generate Key - Non-Existent Project ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/:projectId/keys` with a `projectId` that does not exist | Invalid project ID in path |
| 2 | Observe the response | Response is HTTP 404 (from `findOneByOrFail`) |

### Scenario 7: Generate Key - Name Validation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/:projectId/keys` with `name: "A"` (1 character) | Name too short |
| 2 | Observe the response | Response is HTTP 400 Bad Request |
| 3 | Send `POST /v1/projects/:projectId/keys` with `name` exceeding 100 characters | Name too long |
| 4 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 8: Generate Key - Path Parameter Overrides Body projectId

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/:projectIdA/keys` with `projectId: ":projectIdB"` in the request body | Conflicting project IDs |
| 2 | Verify the created key | Key is associated with `:projectIdA` (path parameter takes precedence) |

### Scenario 9: Bulk Delete Keys - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create two additional keys for the project | Two keys available for deletion |
| 2 | Send `DELETE /v1/projects/:projectId/keys` with `ids` containing both key IDs | Valid bulk delete request |
| 3 | Verify the response | Response is HTTP 200 with message "Project key deleted successfully" |
| 4 | Verify the database | Records are soft-deleted (marked as deleted, not permanently removed) |

### Scenario 10: Bulk Delete Keys - IDs Not Found

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/projects/:projectId/keys` with `ids` containing non-existent UUIDs | Invalid key IDs |
| 2 | Observe the response | Response is HTTP 404 Not Found with message "Data not found" |

### Scenario 11: Bulk Delete Keys - Empty IDs Array

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/projects/:projectId/keys` with `ids: []` | Empty array |
| 2 | Observe the response | Response is HTTP 400 Bad Request (Zod validation) |

### Scenario 12: Delete Default Key - No Special Protection

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Identify the default key auto-generated during project creation | Default key found |
| 2 | Send `DELETE /v1/projects/:projectId/keys` with the default key's ID | Delete default key |
| 3 | Verify the response | Response is HTTP 200; key is soft-deleted without any special protection |

### Scenario 13: Soft-Deleted Key Fails SDK Authentication

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a key and note the `plainKey` | Key created |
| 2 | Soft-delete the key via `DELETE /v1/projects/:projectId/keys` | Key is soft-deleted |
| 3 | Attempt to use the deleted plain key for capture authentication (`validateKeyPlain`) | Authentication attempt with deleted key |
| 4 | Observe the result | Authentication fails (HTTP 403); `validateKeyPlain` does not find deleted keys |

### Scenario 14: Lost Plain Key - No Recovery Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a key and discard the `plainKey` without saving it | Plain key is lost |
| 2 | Attempt to retrieve the plain key via any API endpoint | No endpoint returns `plainKey` |
| 3 | Confirm recovery is impossible | User must create a new key to authenticate |
