# AC: N8N Integration

## Context

Webhook callback endpoint (`POST /v1/n8n/callback/ai-analyze-query-transaction-event`) for receiving AI analysis results from an N8N workflow. After N8N completes query transaction event analysis, results are sent to this endpoint to be saved and forwarded as a Slack notification to the requesting user.

## Acceptance Criteria

### Receive AI Analysis Callback

#### Happy Path

- [ ] Given a valid callback payload with `id`, `fileStorageId`, `slackUserId`, `slackChannelId`, and optional `slackMessageTs`, when N8N sends a POST to `/v1/n8n/callback/ai-analyze-query-transaction-event`, then the API returns `200 OK` with message "Callback received" and `data: null`.
- [ ] Given a successful callback, when the response is returned, then the processing is fire-and-forget -- the controller does not `await` the service call and returns immediately.

#### Save Report

- [ ] Given a valid callback, when processing begins in the background, then the AI analysis report is saved via `saveAIAnalyzeReport(id, fileStorageId)`.

#### Slack Notification

- [ ] Given a valid callback with `slackUserId` and `slackChannelId`, when the report is saved, then a notification is sent to the requesting Slack user via `sendAIAnalyzeReportToRequester()`.
- [ ] Given a valid callback with `slackMessageTs`, when the Slack notification is sent, then it is delivered as a thread reply to the original message.
- [ ] Given a valid callback without `slackMessageTs` (optional field), when the Slack notification is sent, then it may not be sent as a thread reply.

#### Validation Errors

- [ ] Given an empty `fileStorageId` (less than 1 character), when calling the callback endpoint, then the API returns a Zod validation error with message "File storage ID is required".
- [ ] Given an empty `slackUserId` (less than 1 character), when calling the callback endpoint, then the API returns a Zod validation error with message "Slack User ID is required".
- [ ] Given an empty `slackChannelId` (less than 1 character), when calling the callback endpoint, then the API returns a Zod validation error with message "Slack Channel ID is required".
- [ ] Given a missing `id` field, when calling the callback endpoint, then the API returns a Zod validation error.
- [ ] Given a missing `fileStorageId` field, when calling the callback endpoint, then the API returns a Zod validation error.
- [ ] Given a missing `slackUserId` field, when calling the callback endpoint, then the API returns a Zod validation error.
- [ ] Given a missing `slackChannelId` field, when calling the callback endpoint, then the API returns a Zod validation error.

#### Error Scenarios

- [ ] Given an error that occurs during background processing (saving report or sending Slack notification), when the callback was already acknowledged, then the response remains `200 OK` because the processing is fire-and-forget.

#### Edge Cases

- [ ] Given the callback endpoint, when called, then it does not require JWT authentication (uses `@ExcludeGlobalGuard()`).
- [ ] Given the N8N workflow trigger, when AI analysis is initiated, then it uses webhook ID `ac954675-1d6c-40a6-9582-85bdf6e9d75b` (this ID is used when triggering N8N, not on the callback).
