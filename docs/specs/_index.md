# Specs Index

> Machine-readable index for AI agents. All paths relative to `docs/specs/`.
> Language: Bahasa Indonesia with English technical terms.
> Last updated: 2026-04-17

## How to Use

- **Find specs by module**: Search for the module name (e.g., `query_transaction`) in the Master Module Table (Section 4).
- **Find specs by concept**: Search the Keyword Index (Section 6) for business terms like "query", "severity", "capture".
- **Understand a feature end-to-end**: Read in order: PRD (why) → FSD (what/how) → AC (acceptance gates) → Test Scenario (verification steps).
- **Each directory** has a `_template.md` showing the document format.

---

## Directory Layout

| Directory | Files | Content | Format |
|-----------|-------|---------|--------|
| `prd/` | 5 | Product Requirements — problem, solution, functional requirements (FR-XXX-YY) | Narrative + numbered requirements |
| `fsd/` | 21 | Functional Specs — API endpoints, request/response schemas, actions, error cases | Tables + schema blocks |
| `ac/` | 18 | Acceptance Criteria — Given/When/Then checklist | Checkbox list |
| `test-scenarios/` | 18 | Test Scenarios — preconditions, step-by-step action/result | Numbered step tables |

- AC and Test Scenarios have **identical file sets** (1:1 mapping).
- FSD has **3 extra files** not in AC/Test — see Section 5.

---

## PRD-to-Modules Mapping

Each PRD groups multiple FSD/AC/Test modules. Format: PRD file → downstream FSD files it covers.

### prd/query-analysis.md
→ query-transaction-event-capture, query-transaction-management

### prd/authentication-and-access-control.md
→ auth-login, auth-oauth2, auth-session, auth-forgot-password, user-management, user-import-export, role-management, permission-management, resource-management, operation-management

### prd/project-management.md
→ project-management, project-key-management, project-setting-management, project-slack-channel, platform-management

### prd/integrations.md
→ slack-integration, n8n-integration

### prd/supporting-infrastructure.md
→ storage-file, health-check

---

## Master Module Table

Module names use underscore convention (matching `src/modules/` domain names). File names omit `.md`. Dash (`-`) = no file for that type.

### Query Analysis (Core)

| Module | Pri | PRD | FSD | AC | Test |
|--------|-----|-----|-----|----|------|
| query_transaction_event | P0 | query-analysis | query-transaction-event-capture | query-transaction-event-capture | query-transaction-event-capture |
| query_transaction | P0 | query-analysis | query-transaction-management | query-transaction-management | query-transaction-management |

### Authentication & Access Control

| Module | Pri | PRD | FSD | AC | Test |
|--------|-----|-----|-----|----|------|
| auth_login | P0 | authentication-and-access-control | auth-login | auth-login | auth-login |
| auth_oauth2 | P0 | authentication-and-access-control | auth-oauth2 | auth-oauth2 | auth-oauth2 |
| auth_session | P0 | authentication-and-access-control | auth-session | auth-session | auth-session |
| auth_forgot_password | P0 | authentication-and-access-control | auth-forgot-password | auth-forgot-password | auth-forgot-password |
| user | P0 | authentication-and-access-control | user-management | user-management | user-management |
| user_import_export | P1 | authentication-and-access-control | user-import-export | user-import-export | user-import-export |
| role | P0 | authentication-and-access-control | role-management | role-management | role-management |
| permission | P0 | authentication-and-access-control | permission-management | permission-management | permission-management |
| resource | P1 | authentication-and-access-control | resource-management | - | - |
| operation | P1 | authentication-and-access-control | operation-management | - | - |

### Project Management

| Module | Pri | PRD | FSD | AC | Test |
|--------|-----|-----|-----|----|------|
| project | P0 | project-management | project-management | project-management | project-management |
| project_key | P0 | project-management | project-key-management | project-key-management | project-key-management |
| project_setting | P0 | project-management | project-setting-management | project-setting-management | project-setting-management |
| project_slack_channel | P1 | project-management | project-slack-channel | project-slack-channel | project-slack-channel |
| platform | P1 | project-management | platform-management | platform-management | platform-management |

### Integrations

| Module | Pri | PRD | FSD | AC | Test |
|--------|-----|-----|-----|----|------|
| slack | P1 | integrations | slack-integration | slack-integration | slack-integration |
| n8n | P1 | integrations | n8n-integration | n8n-integration | n8n-integration |

### Support & Infrastructure

| Module | Pri | PRD | FSD | AC | Test |
|--------|-----|-----|-----|----|------|
| storage_file | P1 | supporting-infrastructure | storage-file | storage-file | storage-file |
| health | P2 | supporting-infrastructure | health-check | - | - |

---

## FSD-Only Files

These FSD files have no dedicated AC or Test Scenario file. They are read-only/reference features with no testable write actions.

| FSD File | Covered By | Reason |
|----------|------------|--------|
| resource-management | - | Read-only RBAC reference data |
| operation-management | - | Read-only RBAC reference data |
| health-check | - | Simple liveness probe, no business logic |

---

## Keyword Index

Bilingual search terms (English / Bahasa Indonesia) mapped to relevant modules.

| Keywords | Modules |
|----------|---------|
| query, SQL, ORM, database query, kueri | query_transaction_event, query_transaction |
| capture, event, SDK, ingest | query_transaction_event |
| severity, critical, high, medium, low, threshold | query_transaction_event, project_setting |
| signature, deduplication, aggregation | query_transaction_event, query_transaction |
| execution time, performance, slow query, lambat | query_transaction_event, query_transaction |
| execution plan, EXPLAIN, query plan | query_transaction_event |
| login, SSO, OAuth2, authentication, autentikasi | auth_login, auth_oauth2 |
| token, JWT, refresh, access token | auth_login, auth_session |
| forgot password, reset password, lupa password | auth_forgot_password |
| session, logout, me, sesi | auth_session |
| user, pengguna, akun | user, user_import_export |
| import, export, Excel, CSV, PDF, unggah | user_import_export |
| role, peran, hak akses | role |
| permission, izin, RBAC, otorisasi | permission, resource, operation |
| project, proyek, aplikasi | project, project_key, project_setting, project_slack_channel |
| API key, kunci API, SDK key | project_key |
| setting, konfigurasi, pengaturan | project_setting |
| platform, framework, ORM, database provider | platform |
| Slack, notification, notifikasi, alert | slack, project_slack_channel |
| N8N, webhook, AI analysis, analisis | n8n |
| file, storage, upload, download, simpan | storage_file |
| health, liveness, readiness, status | health |

---

## Reading Order

For any feature, read specs in this order:

1. **PRD** → business problem, solution scope, functional requirements
2. **FSD** → API endpoints, request/response schemas, actions, error cases
3. **AC** → acceptance criteria (Given/When/Then checklist)
4. **Test Scenario** → preconditions, step-by-step verification

### Workflow Shortcuts

| Task | Read |
|------|------|
| Implementing a new endpoint | FSD → AC |
| Fixing a bug | AC → Test Scenario |
| Understanding business context | PRD → FSD |
| Writing tests | AC + Test Scenario |
| Reviewing a feature scope | PRD only |
| Checking validation rules | AC (Validation & Error section) |
