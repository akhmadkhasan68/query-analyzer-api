# AC: Project Management

## Context

CRUD endpoints for managing projects in the Query Analyzer system. Each project represents an application or service being monitored. Projects are linked to a platform, optionally to a Gitlab repository and Slack channels, and automatically receive a default API key upon creation. All operations require JWT authentication and permission-based access control.

## Acceptance Criteria

### Paginate Projects (`GET /v1/projects`)

- [ ] Given a valid JWT token with `PROJECT.VIEW` permission and no query parameters, when a paginate request is sent, then the response is HTTP 200 with default pagination (`page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC`)
- [ ] Given a valid JWT token and `status=active`, when a paginate request is sent, then only projects with status `active` are returned
- [ ] Given a valid JWT token and `search=Payment`, when a paginate request is sent, then matching projects are returned
- [ ] Given a valid JWT token, when projects are returned, then each includes `platform`, `keys` (with `maskedKey`, never `plainKey`), and `projectGitlab` relations
- [ ] Given no JWT token, when a paginate request is sent, then the response is HTTP 401 Unauthorized

### Get Project Detail (`GET /v1/projects/:id`)

- [ ] Given a valid JWT token with `PROJECT.VIEW` permission and a valid project ID, when a detail request is sent, then the response is HTTP 200 with project data including `platform` and `projectKeys` relations
- [ ] Given a valid JWT token and a project ID that does not exist, when a detail request is sent, then the response is HTTP 404 Not Found with message "Data not found"

### Create Project (`POST /v1/projects`)

- [ ] Given a valid JWT token with `PROJECT.CREATE` permission and a valid request body with `name`, `platformId`, and optional `description`, `status`, `gitlab`, `slackChannel`, when a create request is sent, then the response is HTTP 201 with the created project including a default API key with both `maskedKey` and `plainKey`
- [ ] Given `plainKey` is returned in the create response, when the same project is retrieved later via GET, then `plainKey` is no longer available (only `maskedKey` is shown)
- [ ] Given a project name that already exists in the database, when a create request is sent, then the response is HTTP 422 Unprocessable Entity with message "Project with name '[name]' already exists"
- [ ] Given a `platformId` that does not exist in the database, when a create request is sent, then the response is HTTP 404 Not Found
- [ ] Given the `name` field is less than 2 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `name` field exceeds 100 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `description` field exceeds 500 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given `status` is not provided, when the project is created, then the status defaults to `active`
- [ ] Given `gitlab` information is provided with a valid `url`, `projectId`, `groupId`, `groupName`, `defaultBranch`, `visibility`, when the project is created, then a Gitlab entity is also created and linked to the project
- [ ] Given `gitlab.url` is not a valid URL format, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given `slackChannel` information is provided with a valid `slackChannelId`, when the project is created, then a Slack channel association is also created and linked to the project
- [ ] Given the default API key is generated, when checking its format, then it uses prefix `qm_live_` followed by 48 hex characters (24 random bytes), the stored `hashedKey` is a bcrypt hash, and `maskedKey` shows first 4 chars + `****` + last 4 chars
- [ ] Given all creation operations (project, key, gitlab, slack channel), when they execute, then they run within a single database transaction; if any fails, all are rolled back

### Update Project (`PUT /v1/projects/:id`)

- [ ] Given a valid JWT token with `PROJECT.UPDATE` permission, a valid project ID, and a valid request body, when an update request is sent, then the response is HTTP 200 with message "Project updated successfully"
- [ ] Given the updated `name` already exists for a different project, when an update request is sent, then the response is HTTP 422 Unprocessable Entity with message "Project with name '[name]' already exists"
- [ ] Given the project ID does not exist, when an update request is sent, then the response is HTTP 404 Not Found with message "Data not found"
- [ ] Given `gitlab` or `slackChannel` fields are included in the update body, when the update is processed, then those fields are ignored (Gitlab info is not updated on this endpoint)
- [ ] Given only `name`, `description`, `status`, and `platformId` are provided, when the update is processed, then only those fields are updated on the project

### Delete Projects (`DELETE /v1/projects`)

- [ ] Given a valid JWT token with `PROJECT.DELETE` permission and `ids` containing valid project IDs, when a delete request is sent, then the response is HTTP 200 with message "Projects detail deleted successfully"
- [ ] Given valid project IDs, when deletion is processed, then related data is deleted in order within a transaction: projectGitlab -> projectSlackChannels -> projectKeys -> projects
- [ ] Given one of the `ids` does not exist in the database, when a delete request is sent, then the response is HTTP 404 Not Found and no projects are deleted
- [ ] Given a deletion transaction fails midway, when the error occurs, then all deletions are rolled back and no data is removed
- [ ] Given `ids` is an empty array, when a delete request is sent, then the response is HTTP 400 Bad Request
