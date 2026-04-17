# Integrations -- PRD

## Problem

Development teams need real-time notifications when slow queries are detected and the ability to trigger AI-powered query analysis directly from their collaboration tools. Without integration into existing workflows, critical performance alerts go unnoticed and teams must context-switch to separate tools for investigation. The AI analysis pipeline requires orchestration across multiple services (data retrieval, LLM analysis, report generation, storage) that is best handled by a workflow automation platform.

## Solution

Provide two integration modules: (1) Slack integration for real-time alert delivery, slash commands, and interactive button handling that allows teams to trigger AI analysis directly from alert messages; (2) N8N integration for orchestrating the AI analysis pipeline via webhooks and callbacks, where N8N handles the heavy lifting of query analysis using LLMs and returns results through a callback endpoint.

## Functional Requirements

### Slack Integration

- FR-INT-01: The system shall expose a slash command handler via `POST /v1/slack/command/:slashCommand` that accepts Slack command payloads (including `token`, `team_id`, `channel_id`, `user_id`, `command`, `text`, `response_url`, `trigger_id`). The endpoint shall bypass the global JWT auth guard.
- FR-INT-02: The system shall validate incoming slash commands against the `SlackCommandEnum` registry. Currently registered commands include `test`. Invalid commands shall return an error message string.
- FR-INT-03: The system shall expose an interactive message handler via `POST /v1/slack/interaction` that accepts Slack interactive payloads (URL-encoded `payload` field containing JSON). The endpoint shall bypass the global JWT auth guard.
- FR-INT-04: The interactive handler shall parse the payload into a structured DTO containing `actions` (array with `actionId`, `value`, `type`), `user` (with `id`, `username`, `name`), and `container` (with `channelId`, `messageTs`, `type`).
- FR-INT-05: The system shall handle the `btn-ai-analyze-query-event` interactive action by: (a) looking up the query transaction event by the action's `value` (which is the `queryId`), (b) retrieving the project's Slack channels, (c) triggering the AI analysis pipeline with the event ID, Slack user ID, Slack channel ID, and message timestamp for thread replies.
- FR-INT-06: The system shall support sending Block Kit-formatted messages to Slack channels via the `chat.postMessage` API, using the `SlackMessageV1Service`. Message sending shall be asynchronous through a dedicated BullMQ `Slack` queue with the `SendSlackMessage` job type.
- FR-INT-07: The system shall support sending messages to multiple Slack channels simultaneously by enqueuing separate jobs for each channel.
- FR-INT-08: The system shall support sending messages as thread replies by including the `threadTs` parameter in the message payload.
- FR-INT-09: Slow query alert messages shall be formatted using Slack Block Kit with the following structure: header with alert emoji, divider, severity section with color-coded emoji (blue for LOW, yellow for MEDIUM, orange for HIGH, red for CRITICAL), introductory text mentioning `@channel`, raw query in a code block (truncated to 1500 characters), stack traces in a code block (if present), detail section with project name/environment/execution time/query ID, and an actions section with an "AI Analyze" button.
- FR-INT-10: AI analysis report messages shall be formatted with a header, introductory text mentioning the requesting user by Slack ID, a note that the URL is active for 24 hours, and a "View Details" button linking to the report file URL.

### N8N Integration

- FR-INT-11: The system shall trigger N8N workflows by sending HTTP POST requests to `/webhook/{webhookId}` on the configured N8N instance, using the `HttpIntegrationV1Service`. The webhook ID for AI query analysis is a UUID constant (`ac954675-1d6c-40a6-9582-85bdf6e9d75b`).
- FR-INT-12: The N8N webhook payload for AI analysis shall include: `id` (query transaction event ID), `slackUserId`, `slackChannelId`, and `slackMessageTs` (optional).
- FR-INT-13: The system shall expose a callback endpoint at `POST /v1/n8n/callback/ai-analyze-query-transaction-event` that bypasses global auth guards, accepting: `id` (event ID), `fileStorageId` (ID of the stored analysis report file), `slackUserId`, `slackChannelId`, and `slackMessageTs` (optional).
- FR-INT-14: Upon receiving the N8N callback, the system shall: (a) save an analysis report record linking the query transaction event to the storage file (creating new or returning existing), (b) retrieve the file URL from the storage service, (c) send the analysis report message to the Slack requester -- as a thread reply if `slackMessageTs` is provided, or as a new message to all project Slack channels otherwise.
- FR-INT-15: If an analysis report already exists for an event when AI analysis is re-requested, the system shall return the cached report immediately without re-triggering the N8N workflow.

## Out of Scope

- Slack OAuth2 app installation flow (bot token is pre-configured)
- Slack event subscriptions (only slash commands and interactive messages are supported)
- Slack signature verification for request authenticity
- N8N workflow definition and management (managed externally in N8N)
- Support for workflow automation platforms other than N8N
- Direct LLM/AI model integration within the API (delegated to N8N)
- Webhook retry logic and dead-letter queues for failed N8N calls
