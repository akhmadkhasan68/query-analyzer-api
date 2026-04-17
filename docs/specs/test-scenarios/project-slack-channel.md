# Test Scenarios: Project Slack Channel

## Preconditions

- A project exists in the database with a known `projectId`
- A valid JWT token is available for an authenticated user with appropriate permissions (`PROJECT_SLACK_CHANNEL.VIEW`, `PROJECT_SLACK_CHANNEL.CREATE`, `PROJECT_SLACK_CHANNEL.DELETE`)
- The endpoints are available at `GET /v1/projects/:projectId/slack-channels`, `POST /v1/projects/:projectId/slack-channels`, `DELETE /v1/projects/:projectId/slack-channels`

## Scenarios

### Scenario 1: Associate Slack Channel - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/:projectId/slack-channels` with `slackChannelId: "C0123456789"` | Valid create request |
| 2 | Verify the response | Response is HTTP 201 with created association including `id`, `project` details, and `slackChannelId` |

### Scenario 2: Duplicate Slack Channel Rejection (Same Project)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Associate `slackChannelId: "C0123456789"` with the project | First association succeeds |
| 2 | Send `POST /v1/projects/:projectId/slack-channels` with the same `slackChannelId: "C0123456789"` | Duplicate channel for same project |
| 3 | Observe the response | Response is HTTP 422 Unprocessable Entity with message "Slack Channel ID already exists" |

### Scenario 3: Same Slack Channel Allowed on Different Project

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Associate `slackChannelId: "C0123456789"` with Project A | Association created for Project A |
| 2 | Send `POST /v1/projects/:projectIdB/slack-channels` with `slackChannelId: "C0123456789"` | Same channel ID for different project |
| 3 | Verify the response | Response is HTTP 201; association is created successfully (uniqueness is scoped to the project) |

### Scenario 4: Associate Channel - Non-Existent Project ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/:nonExistentId/slack-channels` with a valid `slackChannelId` | Project does not exist |
| 2 | Observe the response | Response is HTTP 404 Not Found |

### Scenario 5: Associate Channel - Invalid Project ID Format

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/not-a-uuid/slack-channels` with a valid `slackChannelId` | Invalid UUID in path |
| 2 | Observe the response | Response is HTTP 400 Bad Request (from `ParseUUIDPipe`) |

### Scenario 6: Associate Channel - slackChannelId Validation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/projects/:projectId/slack-channels` with `slackChannelId: "A"` (1 character) | Too short |
| 2 | Observe the response | Response is HTTP 400 Bad Request |
| 3 | Send with `slackChannelId` exceeding 100 characters | Too long |
| 4 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 7: Paginate Slack Channels - Default Pagination

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects/:projectId/slack-channels` with no query parameters | Default pagination |
| 2 | Verify the response | Response is HTTP 200 with defaults `page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC` |
| 3 | Verify each channel in response | Each includes `id`, `project`, and `slackChannelId` |

### Scenario 8: Paginate Slack Channels - Search

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects/:projectId/slack-channels?search=C012` | Search filter applied |
| 2 | Verify the response | Matching channels are returned |

### Scenario 9: Paginate Slack Channels - No JWT Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/projects/:projectId/slack-channels` without a JWT token | No authentication |
| 2 | Observe the response | Response is HTTP 401 Unauthorized |

### Scenario 10: Delete Slack Channel Associations - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Associate two Slack channels with the project | Two associations exist |
| 2 | Send `DELETE /v1/projects/:projectId/slack-channels` with `ids` containing both association IDs | Valid delete request |
| 3 | Verify the response | Response is HTTP 200 with message "Project key deleted successfully" (known message in code) |
| 4 | Verify the database | Records are soft-deleted (marked as deleted, not permanently removed) |

### Scenario 11: Delete Slack Channels - IDs Not Found

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/projects/:projectId/slack-channels` with `ids` containing non-existent UUIDs | Invalid IDs |
| 2 | Observe the response | Response is HTTP 404 Not Found |

### Scenario 12: Delete Slack Channels - Non-UUID IDs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/projects/:projectId/slack-channels` with `ids: ["not-a-uuid"]` | Invalid UUID format in array |
| 2 | Observe the response | Response is HTTP 400 Bad Request (Zod validation: array must contain UUID strings) |

### Scenario 13: Delete Slack Channels - Empty IDs Array

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/projects/:projectId/slack-channels` with `ids: []` | Empty array |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 14: Impact on Notifications - Channels Receive Capture Alerts

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Associate two Slack channels with the project | Two channels linked |
| 2 | Send a capture event for the project | Event is processed |
| 3 | Verify notifications | Both associated channels receive the alert notification |

### Scenario 15: Impact on Notifications - Soft-Deleted Channels Excluded

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Associate a Slack channel and then soft-delete it | Channel is soft-deleted |
| 2 | Send a capture event for the project | Event is processed |
| 3 | Verify notifications | No Slack notifications are sent for the soft-deleted channel |
