# Project Management -- PRD

## Problem

The QueryAnalyzer platform needs to organize query analysis by application project. Each monitored application requires its own SDK integration keys for authentication, per-project severity thresholds for customized alerting, Slack channel associations for notifications, and GitLab project linking for source code context. Without project-level organization, there is no way to scope queries, configure alert behavior, or manage access keys for different applications.

## Solution

Provide a Project Management module that supports full project lifecycle management with platform association (framework, ORM, database), API key generation and revocation for SDK authentication, configurable per-project severity thresholds stored as JSONB settings, Slack channel associations for alert routing, and GitLab project linking for repository context. Projects have lifecycle statuses (ACTIVE, INACTIVE, ARCHIVED) and support bulk deletion.

## Functional Requirements

- FR-PM-01: The system shall support project creation via `POST /v1/projects` with the following fields: `name` (string, 2-100 characters, required), `description` (string, max 500 characters, optional), `status` (enum: `active`, `inactive`, `archived`, defaults to `active`), `platformId` (UUID, required, links to a platform entity representing the framework/ORM/database combination), `gitlab` (optional object with `projectId`, `url`, `groupId`, `groupName`, `defaultBranch`, `visibility`), and `slackChannel` (optional object with `slackChannelId`).
- FR-PM-02: The system shall support project update via `PUT /v1/projects/:id` with the same fields as creation. Project update shall require the `update` permission on the `project` resource.
- FR-PM-03: The system shall support project detail retrieval via `GET /v1/projects/:id` and paginated listing via `GET /v1/projects`, both requiring the `view` permission on the `project` resource.
- FR-PM-04: The system shall support bulk project deletion via `DELETE /v1/projects` accepting an `ids` array of project IDs in the request body, requiring the `delete` permission on the `project` resource.
- FR-PM-05: The system shall support API key generation for SDK authentication via `POST /v1/projects/:projectId/keys` with a `name` field. The key generation process shall: (a) generate a plain key with the prefix `qm_live_` followed by 24 random hex bytes (48 characters), (b) hash the plain key using bcrypt for storage, (c) generate a masked version showing only the first 4 and last 4 characters, and (d) return the plain key to the user only once at creation time.
- FR-PM-06: A default API key shall be automatically created when a new project is initialized, with the name "Default Key".
- FR-PM-07: The system shall support paginated listing of project keys via `GET /v1/projects/:projectId/keys` (requiring `view` on `project`) and bulk key revocation via `DELETE /v1/projects/:projectId/keys` accepting an `ids` array (requiring `delete` on `project-key`). Revocation shall perform a soft delete.
- FR-PM-08: The `ProjectApiKeyGuard` shall authenticate SDK requests by extracting the API key from the `x-api-key` header (or `Authorization: Bearer` header as fallback) and the project ID from the `x-project-id` header, then validating the plain key against the stored bcrypt hash for the specified project.
- FR-PM-09: The system shall support per-project severity threshold configuration via `POST /v1/projects/:projectId/settings`. Settings are stored as key-value pairs where the key is an enum (currently `SEVERITY`) and the values field is JSONB. For severity settings, the JSONB contains an array of objects with `level` (one of `low`, `medium`, `high`, `critical`) and `threshold` (number in milliseconds). The endpoint shall perform an upsert (create or update) operation.
- FR-PM-10: The system shall support paginated listing of project settings via `GET /v1/projects/:projectId/settings` (requiring `view` on `project-setting`) and bulk deletion via `DELETE /v1/projects/:projectId/settings` accepting an `ids` array (requiring `delete` on `project-setting`).
- FR-PM-11: The system shall support Slack channel association for projects via `POST /v1/projects/:projectId/slack-channels` with a `slackChannelId` field, enabling query alert notifications to be routed to specified Slack channels.
- FR-PM-12: The system shall support paginated listing of project Slack channels via `GET /v1/projects/:projectId/slack-channels` (requiring `view` on `project-slack-channel`) and bulk disassociation via `DELETE /v1/projects/:projectId/slack-channels` accepting an `ids` array (requiring `delete` on `project-slack-channel`).
- FR-PM-13: The system shall support GitLab project linking during project creation or update, storing `projectId` (GitLab numeric ID), `url`, `groupId`, `groupName`, `defaultBranch`, and `visibility` fields.
- FR-PM-14: When resolving a project for query event processing, the system shall eagerly load the `platform`, `projectGitlab`, and `projectSlackChannels` relations.

## Out of Scope

- API key rotation with grace periods (current implementation is generate/revoke)
- Test vs. live key environment distinction (prefix `qm_test_` is reserved but not yet implemented)
- GitLab API integration for fetching repository metadata automatically
- Project member management and per-project user access
- Rate limiting per API key
- API key usage analytics and audit logs
