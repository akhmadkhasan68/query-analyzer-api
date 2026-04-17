# AC: Project Slack Channel

## Context

Endpoints for managing Slack channel associations with projects. Slack channels registered to a project receive notifications for query analysis events (e.g., slow query alerts). All endpoints require JWT authentication and permission-based access control.

## Acceptance Criteria

### Paginate Slack Channels (`GET /v1/projects/:projectId/slack-channels`)

- [ ] Given a valid JWT token with `PROJECT_SLACK_CHANNEL.VIEW` permission and a valid `projectId`, when a paginate request is sent, then the response is HTTP 200 with paginated Slack channels including `id`, `project`, and `slackChannelId`
- [ ] Given default pagination parameters, when a paginate request is sent, then defaults are `page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC`
- [ ] Given a `search` parameter, when a paginate request is sent, then matching channels are returned
- [ ] Given no JWT token, when a paginate request is sent, then the response is HTTP 401 Unauthorized

### Create Slack Channel Association (`POST /v1/projects/:projectId/slack-channels`)

- [ ] Given a valid JWT token with `PROJECT_SLACK_CHANNEL.CREATE` permission, a valid `projectId` (UUID), and a request body with a valid `slackChannelId`, when a create request is sent, then the response is HTTP 201 with the created association including `id`, `project` details, and `slackChannelId`
- [ ] Given the `projectId` does not exist in the database, when a create request is sent, then the response is HTTP 404 Not Found
- [ ] Given the `projectId` is not a valid UUID format, when a create request is sent, then the response is HTTP 400 Bad Request (from `ParseUUIDPipe`)
- [ ] Given the same `slackChannelId` is already associated with the same project, when a create request is sent, then the response is HTTP 422 Unprocessable Entity with message "Slack Channel ID already exists"
- [ ] Given the same `slackChannelId` is associated with a different project, when a create request is sent for the current project, then the association is created successfully (uniqueness is scoped to the project)
- [ ] Given the `slackChannelId` field is less than 2 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `slackChannelId` field exceeds 100 characters, when a create request is sent, then the response is HTTP 400 Bad Request

### Delete Slack Channel Associations (`DELETE /v1/projects/:projectId/slack-channels`)

- [ ] Given a valid JWT token with `PROJECT_SLACK_CHANNEL.DELETE` permission and `ids` containing valid channel association IDs, when a delete request is sent, then the response is HTTP 200 with message "Project key deleted successfully" (known message in code)
- [ ] Given valid association IDs, when deletion is processed, then a soft delete is performed (records are marked as deleted, not permanently removed)
- [ ] Given one or more `ids` that do not exist in the database, when a delete request is sent, then the response is HTTP 404 Not Found
- [ ] Given `ids` contains non-UUID strings, when a delete request is sent, then the response is HTTP 400 Bad Request (Zod validation: array must contain UUID strings)
- [ ] Given an empty `ids` array, when a delete request is sent, then the response is HTTP 400 Bad Request

### Impact on Notifications

- [ ] Given a project has Slack channels associated, when a capture event is processed for that project, then notifications are sent to all associated channels
- [ ] Given all Slack channel associations for a project are soft-deleted, when a capture event is processed, then no Slack notifications are sent for that project
