# AC: Slack Integration

## Context

Endpoints for receiving and processing Slack slash commands (`POST /v1/slack/command/:slashCommand`) and interactive payloads such as button clicks (`POST /v1/slack/interaction`). These endpoints are accessed directly by Slack and do not require JWT authentication (`@ExcludeGlobalGuard()`).

## Acceptance Criteria

### Slash Command Handling (`POST /v1/slack/command/:slashCommand`)

#### Happy Path

- [ ] Given a registered slash command `test`, when Slack sends a POST to `/v1/slack/command/test` with form-urlencoded body containing `text`, then the API returns plain text "You invoked the /test command with text: {text}".
- [ ] Given a valid slash command request, when the request is received, then the body contains `token`, `teamId`, `teamDomain`, `channelId`, `channelName`, `userId`, `userName`, `command`, `text`, `apiAppId`, `responseUrl`, and `triggerId`.

#### Validation Errors

- [ ] Given a `responseUrl` that is not a valid URL, when Slack sends the command, then the API returns a Zod validation error.

#### Error Scenarios

- [ ] Given a slash command name that is not registered in `SlackCommandEnum`, when Slack sends a POST to `/v1/slack/command/{unknownCommand}`, then the API returns plain text "Invalid command: {unknownCommand}".
- [ ] Given a slash command that is registered in the enum but has no handler implemented, when Slack sends the command, then the API returns plain text "Unknown command: {slashCommand}".

#### Edge Cases

- [ ] Given the slash command endpoint, when called, then it does not require JWT authentication (uses `@ExcludeGlobalGuard()`).
- [ ] Given the slash command response, when returned, then it is plain text (not JSON).

---

### Interactive Payload Handling (`POST /v1/slack/interaction`)

#### Happy Path -- AI Analysis Trigger

- [ ] Given a valid interactive payload with `actionId` equal to `btn-ai-analyze-query-event`, when Slack sends the interaction, then the API looks up the query transaction event by the `action.value` (query ID), verifies the project has a Slack channel configured, and triggers AI analysis via `queryTransactionEventService.AIAnalyze()` with `slackUserId`, `slackChannelId`, and `slackMessageTs` parameters.
- [ ] Given a valid interactive payload that is processed successfully, when the interaction completes, then the API returns plain text "OK".

#### Error Scenarios

- [ ] Given a `payload` field that cannot be parsed as valid JSON, when Slack sends the interaction, then the API returns plain text "Invalid payload".
- [ ] Given a valid payload with an empty `actions` array or no `actions` field, when the interaction is received, then the API throws an Error with message "No actions found in the payload".
- [ ] Given a query transaction event that is not found for the given `action.value`, when the AI analyze action is triggered, then an error is thrown from `findOneByQueryId`.

#### Edge Cases

- [ ] Given a valid payload with an unrecognized `actionId`, when the interaction is processed, then a warning is logged ("Unhandled action ID: {actionId}") and the action is skipped without error.
- [ ] Given a valid AI analyze action where the project does not have a Slack channel configured, when the action is processed, then a warning is logged and the function returns without triggering AI analysis.
- [ ] Given the interaction endpoint, when called, then it does not require JWT authentication (uses `@ExcludeGlobalGuard()`).
- [ ] Given the Slack message service, when sending messages to a Slack channel, then messages are sent via a queue (`QueueName.Slack`) to avoid rate limiting.
- [ ] Given the interactive payload structure, when received, then the `payload` field is a JSON string in a form-urlencoded body that must be parsed before processing.
