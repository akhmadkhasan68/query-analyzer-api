# AC: Project Key Management

## Context

Endpoints for managing API keys belonging to a project. API keys are used by SDK/agents to authenticate when sending query events to the capture endpoint. Each project receives a default key upon creation, and additional keys can be generated via these endpoints. Keys are stored as bcrypt hashes; the plain key is only shown once at creation time. All endpoints require JWT authentication and permission-based access control.

## Acceptance Criteria

### Paginate Project Keys (`GET /v1/projects/:projectId/keys`)

- [ ] Given a valid JWT token with `PROJECT.VIEW` permission and a valid `projectId`, when a paginate request is sent, then the response is HTTP 200 with paginated keys showing `id`, `name`, `maskedKey`, and `lastUsedAt`
- [ ] Given paginated keys are returned, when inspecting the response, then `plainKey` is never included in the response
- [ ] Given default pagination parameters, when a paginate request is sent, then defaults are `page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC`
- [ ] Given a `search` parameter, when a paginate request is sent, then only matching keys are returned
- [ ] Given no JWT token, when a paginate request is sent, then the response is HTTP 401 Unauthorized

### Create Project Key (`POST /v1/projects/:projectId/keys`)

- [ ] Given a valid JWT token with `PROJECT_KEY.CREATE` permission, a valid `projectId`, and a request body with `name`, when a create request is sent, then the response is HTTP 201 with the key data including `id`, `name`, `maskedKey`, and `plainKey`
- [ ] Given the key is successfully created, when checking the `plainKey` format, then it starts with `qm_live_` followed by 48 hex characters (total 56 characters)
- [ ] Given the key is successfully created, when checking the `maskedKey` format, then it shows the first 4 characters + `****` + last 4 characters of the plain key (e.g., `qm_l****e5f6`)
- [ ] Given the key is successfully created, when checking the database, then only the bcrypt-hashed version of the key is stored (not the plain key)
- [ ] Given the `plainKey` is returned in the create response, when attempting to retrieve the key later via paginate, then `plainKey` is not available (it can never be retrieved again)
- [ ] Given the `projectId` in the path does not correspond to an existing project, when a create request is sent, then the response is HTTP 404 (from `findOneByOrFail`)
- [ ] Given the `name` field is less than 2 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `name` field exceeds 100 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given a `projectId` in the request body that differs from the path parameter, when a create request is sent, then the path parameter takes precedence (controller overrides `createDto.projectId = projectId`)

### Delete Project Keys (`DELETE /v1/projects/:projectId/keys`)

- [ ] Given a valid JWT token with `PROJECT_KEY.DELETE` permission and `ids` containing valid key IDs, when a delete request is sent, then the response is HTTP 200 with message "Project key deleted successfully"
- [ ] Given valid key IDs, when deletion is processed, then a soft delete is performed (records are marked as deleted but not removed from the database)
- [ ] Given one or more `ids` that do not exist in the database, when a delete request is sent, then the response is HTTP 404 Not Found with message "Data not found"
- [ ] Given an empty `ids` array, when a delete request is sent, then the response is HTTP 400 Bad Request (Zod validation)
- [ ] Given a default key that was auto-generated during project creation, when a delete request includes its ID, then it is soft-deleted without any special protection

### Key Usage for SDK Authentication

- [ ] Given a valid (non-deleted) plain key and matching `projectId`, when `validateKeyPlain` is called during capture, then the key is found and authentication succeeds
- [ ] Given a soft-deleted key, when `validateKeyPlain` is called during capture, then the key is not found and authentication fails (HTTP 403)
- [ ] Given the plain key is lost after creation, when the user needs to authenticate, then they must create a new key (there is no way to recover the plain key)
