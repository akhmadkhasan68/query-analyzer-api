# Test Scenarios: Slack Integration

## Preconditions

- The Slack integration endpoints are configured and accessible
- The `SlackCommandEnum` contains registered slash commands (including `test`)
- Query transaction events exist in the database for interactive payload scenarios
- Projects with Slack channel configurations exist for AI analysis triggers
- The Slack message queue (`QueueName.Slack`) is operational

## Scenarios

### Scenario 1: Handle Registered Slash Command (test)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/command/test` with form-urlencoded body containing `text=hello world`, `token`, `teamId`, `teamDomain`, `channelId`, `channelName`, `userId`, `userName`, `command`, `apiAppId`, `responseUrl`, and `triggerId` | API returns plain text "You invoked the /test command with text: hello world" |
| 2 | Verify response content type | Response is plain text (not JSON) |

### Scenario 2: Handle Slash Command with Invalid responseUrl

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/command/test` with `responseUrl` set to "not-a-url" | API returns a Zod validation error |

### Scenario 3: Handle Unregistered Slash Command

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/command/unknowncommand` where "unknowncommand" is not in `SlackCommandEnum` | API returns plain text "Invalid command: unknowncommand" |

### Scenario 4: Handle Registered Command Without Handler

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/command/{registeredButUnhandled}` where the command is in `SlackCommandEnum` but has no handler implemented | API returns plain text "Unknown command: {registeredButUnhandled}" |

### Scenario 5: Slash Command Does Not Require JWT

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/command/test` without an `Authorization` header | Request is processed normally (no `401 Unauthorized`); endpoint uses `@ExcludeGlobalGuard()` |

### Scenario 6: Handle AI Analysis Interactive Payload

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare a valid Slack interactive payload with `actionId` equal to `btn-ai-analyze-query-event` and `action.value` set to a valid query ID | Payload is ready |
| 2 | Send `POST /v1/slack/interaction` with form-urlencoded body containing `payload` as a JSON string | API returns plain text "OK" |
| 3 | Verify the query transaction event is looked up by `action.value` | Event is found in the database |
| 4 | Verify the project has a Slack channel configured | Slack channel is confirmed |
| 5 | Verify AI analysis is triggered via `queryTransactionEventService.AIAnalyze()` | Called with `slackUserId`, `slackChannelId`, and `slackMessageTs` parameters |

### Scenario 7: Handle Interactive Payload with Invalid JSON

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/interaction` with `payload` set to "not valid json" | API returns plain text "Invalid payload" |

### Scenario 8: Handle Interactive Payload with Empty Actions

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/interaction` with a valid JSON payload but `actions` is an empty array | API throws an Error with message "No actions found in the payload" |

### Scenario 9: Handle Interactive Payload with No Actions Field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/interaction` with a valid JSON payload that has no `actions` field | API throws an Error with message "No actions found in the payload" |

### Scenario 10: Handle Interactive Payload with Non-Existent Query Event

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/interaction` with `actionId` of `btn-ai-analyze-query-event` and `action.value` set to a non-existent query ID | An error is thrown from `findOneByQueryId` |

### Scenario 11: Handle Interactive Payload with Unrecognized Action ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/interaction` with a valid JSON payload and `actionId` of "unknown-action" | A warning is logged ("Unhandled action ID: unknown-action") and the action is skipped without error |

### Scenario 12: Handle AI Analyze Without Slack Channel Configured

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/interaction` with `actionId` of `btn-ai-analyze-query-event` for a project that does not have a Slack channel configured | A warning is logged and the function returns without triggering AI analysis |

### Scenario 13: Interactive Endpoint Does Not Require JWT

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/interaction` without an `Authorization` header | Request is processed normally (no `401 Unauthorized`); endpoint uses `@ExcludeGlobalGuard()` |

### Scenario 14: Slack Messages Sent via Queue

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Trigger an action that sends a Slack message | Message is enqueued via `QueueName.Slack` |
| 2 | Verify the message is not sent directly | Queue is used to avoid rate limiting |

### Scenario 15: Interactive Payload Structure Parsing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/slack/interaction` with `payload` as a JSON string in form-urlencoded body | The `payload` field is correctly parsed from JSON string before processing |
