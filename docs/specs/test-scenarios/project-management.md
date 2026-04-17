# Test Scenarios: Project Management

## Preconditions

- A valid JWT token is available for an authenticated user with appropriate permissions (`PROJECT.VIEW`, `PROJECT.CREATE`, `PROJECT.UPDATE`, `PROJECT.DELETE`)
- At least one platform exists in the database
- The endpoints are available at `GET /v1/projects`, `GET /v1/projects/:id`, `POST /v1/projects`, `PUT /v1/projects/:id`, `DELETE /v1/projects`

## Scenarios

### Scenario 1: Create Project with Full Payload (Platform + GitLab + Slack)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects` with `name: "Payment Service"`, `platformId` (valid), `description: "Handles payments"`, `status: "active"`, `gitlab: {"url": "https://gitlab.com/org/repo", "projectId": "123", "groupId": "456", "groupName": "org", "defaultBranch": "main", "visibility": "private"}`, `slackChannel: {"slackChannelId": "C0123456789"}` | Full payload provided |
| 2 | Verify the response | Response is HTTP 201 with created project data |
| 3 | Verify the project includes a default API key | Response includes API key with both `maskedKey` and `plainKey` |
| 4 | Verify `plainKey` format | Key starts with `qm_live_` followed by 48 hex characters |
| 5 | Verify `maskedKey` format | Shows first 4 chars + `****` + last 4 chars |
| 6 | Verify GitLab entity is linked | GitLab entity is created and associated with the project |
| 7 | Verify Slack channel is linked | Slack channel association is created |

### Scenario 2: Create Project - plainKey Not Available on Subsequent GET

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a project and note the `plainKey` in the response | `plainKey` is returned |
| 2 | Send `GET /v1/projects/:id` for the created project | Retrieve project detail |
| 3 | Verify the response | `plainKey` is no longer available; only `maskedKey` is shown in keys |

### Scenario 3: Create Project - Duplicate Name Rejection

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a project with `name: "UniqueService"` | Project created successfully |
| 2 | Send `POST /v1/projects` with `name: "UniqueService"` again | Duplicate name |
| 3 | Observe the response | Response is HTTP 422 Unprocessable Entity with message "Project with name 'UniqueService' already exists" |

### Scenario 4: Create Project - Non-Existent Platform ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects` with a `platformId` that does not exist in the database | Invalid platform ID |
| 2 | Observe the response | Response is HTTP 404 Not Found |

### Scenario 5: Create Project - Name Validation (Too Short / Too Long)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects` with `name: "A"` (1 character) | Name is too short |
| 2 | Observe the response | Response is HTTP 400 Bad Request |
| 3 | Send `POST /v1/projects` with `name` exceeding 100 characters | Name is too long |
| 4 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 6: Create Project - Description Exceeds Max Length

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects` with `description` exceeding 500 characters | Description too long |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 7: Create Project - Default Status

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects` with valid `name` and `platformId` but omit `status` | Status not provided |
| 2 | Verify the created project | Status defaults to `active` |

### Scenario 8: Create Project - Invalid GitLab URL

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects` with `gitlab.url: "not-a-url"` | Invalid URL format |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 9: Create Project - Transaction Rollback on Failure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate a failure during one of the creation operations (e.g., Slack channel creation fails) | Part of the transaction fails |
| 2 | Verify the database state | All operations (project, key, GitLab, Slack) are rolled back; no partial data exists |

### Scenario 10: Create Project - Default API Key Storage

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a project and verify the database | Project is created |
| 2 | Check the `hashedKey` in the database | Stored key is a bcrypt hash (not the plain key) |

### Scenario 11: Paginate Projects - Default Pagination

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects` with a valid JWT token and no query parameters | Default pagination applies |
| 2 | Verify the response | Response is HTTP 200 with `page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC` |
| 3 | Verify each project includes relations | Each project includes `platform`, `keys` (with `maskedKey`, never `plainKey`), and `projectGitlab` |

### Scenario 12: Paginate Projects - Filter by Status

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects?status=active` | Filter by status |
| 2 | Verify the response | Only projects with status `active` are returned |

### Scenario 13: Paginate Projects - Search

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects?search=Payment` | Search keyword provided |
| 2 | Verify the response | Matching projects are returned |

### Scenario 14: Paginate Projects - No JWT Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects` without a JWT token | No authentication |
| 2 | Observe the response | Response is HTTP 401 Unauthorized |

### Scenario 15: Get Project Detail - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects/:id` with a valid project ID | Valid project ID |
| 2 | Verify the response | Response is HTTP 200 with project data including `platform` and `projectKeys` relations |

### Scenario 16: Get Project Detail - Non-Existent ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects/:id` with a non-existent UUID | Invalid project ID |
| 2 | Observe the response | Response is HTTP 404 Not Found with message "Data not found" |

### Scenario 17: Update Project - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PUT /v1/projects/:id` with valid `name`, `description`, `status`, `platformId` | Valid update body |
| 2 | Verify the response | Response is HTTP 200 with message "Project updated successfully" |

### Scenario 18: Update Project - Duplicate Name for Different Project

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create two projects: "Service A" and "Service B" | Both projects exist |
| 2 | Send `PUT /v1/projects/:idB` with `name: "Service A"` | Name conflicts with another project |
| 3 | Observe the response | Response is HTTP 422 Unprocessable Entity with message "Project with name 'Service A' already exists" |

### Scenario 19: Update Project - Non-Existent Project ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PUT /v1/projects/:id` with a non-existent UUID | Invalid project ID |
| 2 | Observe the response | Response is HTTP 404 Not Found with message "Data not found" |

### Scenario 20: Update Project - GitLab and Slack Fields Ignored

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PUT /v1/projects/:id` with `gitlab` and `slackChannel` fields in the body | Extra fields included |
| 2 | Verify the database | GitLab and Slack channel data are not updated (fields are ignored) |

### Scenario 21: Delete Projects - Happy Path (Batch Delete)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/projects` with `ids` containing valid project IDs | Valid deletion request |
| 2 | Verify the response | Response is HTTP 200 with message "Projects detail deleted successfully" |
| 3 | Verify related data is deleted in order | Deletion order within transaction: projectGitlab -> projectSlackChannels -> projectKeys -> projects |

### Scenario 22: Delete Projects - One ID Not Found

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/projects` with `ids` containing one valid and one non-existent UUID | Mixed valid and invalid IDs |
| 2 | Observe the response | Response is HTTP 404 Not Found; no projects are deleted |

### Scenario 23: Delete Projects - Transaction Rollback on Failure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate a deletion transaction failing midway | Transaction error occurs |
| 2 | Verify the database | All deletions are rolled back; no data is removed |

### Scenario 24: Delete Projects - Empty IDs Array

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/projects` with `ids: []` | Empty array |
| 2 | Observe the response | Response is HTTP 400 Bad Request |
