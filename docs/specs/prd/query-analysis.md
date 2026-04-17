# Query Analysis Engine -- PRD

## Problem

Applications using ORMs (Object-Relational Mappers) frequently generate slow or inefficient SQL queries that go undetected until they cause production incidents. Developers lack visibility into the performance characteristics of ORM-generated SQL across different environments. Without automated detection and analysis, performance regressions accumulate silently, leading to degraded user experience, increased infrastructure costs, and unplanned outages.

## Solution

Provide an automated query analysis pipeline where an SDK installed in the application captures query execution events and sends them to the QueryAnalyzer API. The API authenticates requests via project API keys (transmitted through `x-api-key` and `x-project-id` headers), then processes events asynchronously through BullMQ. Each event is deduplicated by computing a SHA-256 signature from the project ID, project key ID, environment, raw query, and stack trace. Events are aggregated into Query Transactions that track occurrence count and execution time statistics (average, max, min, total). Severity is classified using configurable per-project thresholds (default: CRITICAL >= 2000ms, HIGH >= 1000ms, MEDIUM >= 500ms, LOW < 500ms). When Slack channels are configured for the project, real-time alert notifications are sent with query details and an interactive "AI Analyze" button. Pressing the button triggers an AI analysis pipeline via N8N webhook, and the resulting report is delivered back to the Slack thread.

## Functional Requirements

- FR-QA-01: The system shall accept query transaction events via `POST /v1/query-transaction-events/capture` authenticated by project API key guard (headers `x-api-key` and `x-project-id`), bypassing the global JWT auth guard.
- FR-QA-02: Each captured event shall include: `queryId` (UUID), `rawQuery` (string), `parameters` (optional key-value map), `executionTimeMs` (number), `stackTrace` (optional string array), `timestamp` (ISO date string), `contextType` (string), `environment` (string), `applicationName` (optional), `version` (optional), and `executionPlan` (optional, containing `databaseProvider`, `planFormat`, and `content`).
- FR-QA-03: Upon capture, the system shall enqueue the event to the `QueryTransactionEvent` BullMQ queue for asynchronous processing, attaching the resolved project (with platform, GitLab, and Slack channel relations) and project key details.
- FR-QA-04: During queue processing, the system shall generate a SHA-256 signature from the concatenation of `projectId | projectKeyId | environment | rawQuery` (plus stack trace entries if present, joined by `-`), using pipe (`|`) as the delimiter.
- FR-QA-05: If no Query Transaction exists for the computed signature, the system shall create a new Query Transaction with status `OPEN`, `occurrenceCount` of 1, and initial execution time statistics set to the event's `executionTimeMs`. The `firstOccurrence` timestamp shall be recorded.
- FR-QA-06: If a Query Transaction already exists for the computed signature, the system shall increment `occurrenceCount` by 1, add the event's execution time to `totalExecutionTime`, recalculate `averageExecutionTime` as `totalExecutionTime / occurrenceCount`, and update `maxExecutionTime` and `minExecutionTime` using `Math.max` and `Math.min` respectively.
- FR-QA-07: Query Transaction status shall support the lifecycle states: `OPEN`, `ACCEPTED`, `RESOLVED`, and `ARCHIVED`.
- FR-QA-08: The system shall classify event severity by first checking for project-specific severity threshold settings (stored under `ProjectSettingKeyEnum.SEVERITY` as JSONB containing `level` and `threshold` pairs). If no custom settings exist, default thresholds shall apply: CRITICAL >= 2000ms, HIGH >= 1000ms, MEDIUM >= 500ms, LOW < 500ms.
- FR-QA-09: If the project has associated Slack channels, the system shall send a "Slow Query Detected" alert message to all configured channels. The alert shall include: severity with color-coded emoji, raw query (truncated to 1500 characters), stack traces (if present), project name, environment, execution time, query ID, and an "AI Analyze" interactive button.
- FR-QA-10: If an execution plan is provided with the event, the system shall store it with `databaseProvider`, `planFormat` (contentType, fileExtension, description), and `content` fields.
- FR-QA-11: The system shall provide paginated listing of query transaction events via `GET /v1/query-transaction-events`, protected by JWT authentication.
- FR-QA-12: The system shall support manual creation of Query Transactions via `POST /v1/query-transactions`, protected by JWT Bearer authentication.
- FR-QA-13: The system shall support triggering AI analysis for one or more event IDs. If an event already has an analysis report, the existing report shall be sent directly to the requester. Events without reports shall be enqueued to BullMQ (`SendAIAnalysisEvent` job) for processing.
- FR-QA-14: AI analysis processing shall trigger an N8N webhook (`/webhook/{webhookId}`) with the event ID, Slack user ID, Slack channel ID, and optional Slack message timestamp.
- FR-QA-15: Upon receiving the N8N callback with the analysis results (containing `fileStorageId`, `slackUserId`, `slackChannelId`, `slackMessageTs`, and event `id`), the system shall save an analysis report linking the event to the storage file, then send the report URL back to the Slack requester -- as a thread reply if `slackMessageTs` is provided, or as a new message otherwise.
- FR-QA-16: The system shall support a notify endpoint (`POST /v1/query-transaction-events/notify`) to manually trigger Slack notifications for specified query IDs, validating that all provided IDs exist.
- FR-QA-17: Analysis report file URLs shared via Slack shall be active for 24 hours as indicated in the Slack message template.

## Out of Scope

- SDK implementation and client-side query interception logic
- Database query plan execution and EXPLAIN generation (handled by the SDK)
- Direct database connection or query execution by the API
- User-facing dashboard or web UI for viewing query analytics
- Historical trend analysis and performance regression detection over time
- Multi-tenancy isolation beyond project-level separation
