# Test Scenarios: N8N Integration

## Preconditions

- The N8N callback endpoint is configured and accessible
- Query transaction events exist in the database with known IDs
- File storage records exist for `fileStorageId` references
- The Slack message service is operational for sending notifications
- The N8N webhook ID `ac954675-1d6c-40a6-9582-85bdf6e9d75b` is configured for triggering workflows

## Scenarios

### Scenario 1: Receive AI Analysis Callback Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/n8n/callback/ai-analyze-query-transaction-event` with `{ "id": "{eventId}", "fileStorageId": "{storageId}", "slackUserId": "U12345", "slackChannelId": "C12345", "slackMessageTs": "1234567890.123456" }` | API returns `200 OK` with message "Callback received" and `data: null` |
| 2 | Verify the response is returned immediately | Controller does not `await` the service call (fire-and-forget) |

### Scenario 2: Receive Callback Without Optional slackMessageTs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/n8n/callback/ai-analyze-query-transaction-event` with `{ "id": "{eventId}", "fileStorageId": "{storageId}", "slackUserId": "U12345", "slackChannelId": "C12345" }` (no `slackMessageTs`) | API returns `200 OK` with message "Callback received" and `data: null` |

### Scenario 3: AI Analysis Report Saving

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a valid callback payload | API returns `200 OK` immediately |
| 2 | Verify background processing | AI analysis report is saved via `saveAIAnalyzeReport(id, fileStorageId)` |

### Scenario 4: Slack Notification Sent as Thread Reply

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a valid callback payload with `slackMessageTs` provided | API returns `200 OK` |
| 2 | Verify Slack notification | Notification is sent to the requesting Slack user via `sendAIAnalyzeReportToRequester()` |
| 3 | Verify thread reply | Notification is delivered as a thread reply to the original message using `slackMessageTs` |

### Scenario 5: Slack Notification Without Thread Reply

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a valid callback payload without `slackMessageTs` | API returns `200 OK` |
| 2 | Verify Slack notification | Notification may not be sent as a thread reply since `slackMessageTs` is absent |

### Scenario 6: Callback with Empty fileStorageId

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/n8n/callback/ai-analyze-query-transaction-event` with `{ "id": "{eventId}", "fileStorageId": "", "slackUserId": "U12345", "slackChannelId": "C12345" }` | API returns a Zod validation error with message "File storage ID is required" |

### Scenario 7: Callback with Empty slackUserId

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/n8n/callback/ai-analyze-query-transaction-event` with `{ "id": "{eventId}", "fileStorageId": "{storageId}", "slackUserId": "", "slackChannelId": "C12345" }` | API returns a Zod validation error with message "Slack User ID is required" |

### Scenario 8: Callback with Empty slackChannelId

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/n8n/callback/ai-analyze-query-transaction-event` with `{ "id": "{eventId}", "fileStorageId": "{storageId}", "slackUserId": "U12345", "slackChannelId": "" }` | API returns a Zod validation error with message "Slack Channel ID is required" |

### Scenario 9: Callback with Missing id Field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send the callback payload without the `id` field | API returns a Zod validation error |

### Scenario 10: Callback with Missing fileStorageId Field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send the callback payload without the `fileStorageId` field | API returns a Zod validation error |

### Scenario 11: Callback with Missing slackUserId Field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send the callback payload without the `slackUserId` field | API returns a Zod validation error |

### Scenario 12: Callback with Missing slackChannelId Field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send the callback payload without the `slackChannelId` field | API returns a Zod validation error |

### Scenario 13: Background Processing Error Does Not Affect Response

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a valid callback payload that triggers an error during background processing (saving report or sending Slack notification) | API still returns `200 OK` because processing is fire-and-forget |
| 2 | Verify the error is handled in the background | Error is logged but does not propagate to the HTTP response |

### Scenario 14: Callback Endpoint Does Not Require JWT

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/n8n/callback/ai-analyze-query-transaction-event` without an `Authorization` header | Request is processed normally (no `401 Unauthorized`); endpoint uses `@ExcludeGlobalGuard()` |
