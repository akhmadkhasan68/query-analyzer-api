# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS 11 backend API for ORM Query Analyzer — a platform that captures and analyzes ORM queries from client SDKs. Built on DOT Indonesia's NestJS boilerplate with TypeScript, PostgreSQL (TypeORM), MongoDB (Mongoose for analytics), Redis (BullMQ for queues), and Zod for validation.

## Common Commands

```bash
# Development
yarn start:dev                    # Start dev server with watch mode (port 3000)
docker compose up -d              # Start local Postgres, Redis, Mailpit

# Build & Lint
yarn build                        # Compile TypeScript
yarn lint                         # ESLint with auto-fix
yarn format                       # Prettier formatting

# Database
yarn migrate                      # Run pending migrations
yarn migrate:generate <name>      # Generate migration from entity changes
yarn migrate:revert               # Revert last migration
yarn seed:run <name>              # Run a specific seeder
yarn seed:run:all                 # Run all seeders

# Testing
yarn test                         # Unit tests (*.spec.ts in src/)
yarn test:api                     # API integration tests (tests/scenarios/*.test.js)
yarn test:api:file <pattern>      # Run specific API test file
yarn test:e2e                     # E2E tests

# OpenAPI Documentation
yarn redocly:bundle               # Bundle split OpenAPI spec
yarn redocly:lint-split           # Lint the split spec files
```

## Architecture

### Module Structure

Each feature module in `src/modules/` follows this pattern:

```
modules/<feature>/
├── controllers/          # Route handlers, versioned (e.g., user-v1.controller.ts)
├── services/             # Business logic
├── repositories/         # TypeORM data access (custom query builders)
├── dtos/
│   ├── requests/         # Input validation with Zod schemas
│   └── responses/        # Response formatting DTOs
└── <feature>.module.ts   # NestJS module definition
```

### Key Layers

- **`src/modules/`** — Feature modules: `iam` (auth/JWT/OAuth2), `user`, `project`, `query-transaction` (core analytics), `role`, `permission`, `platform`, `storage-file`, `slack`, `n8n`, `health`
- **`src/infrastructures/`** — Cross-cutting concerns: database config/entities/migrations/seeds, mail (Handlebars templates), OAuth2 providers, storage (local/MinIO/GCS), BullMQ queues, interceptors
- **`src/shared/`** — Constants, enums, exceptions, filters, interfaces, utility functions

### Auth System

- Global JWT guard applied to all routes; use `@Public()` decorator to skip
- `@Permission('action')` decorator for RBAC checks
- `@GetUserLogged()` parameter decorator to extract current user
- `@ProjectKey()` guard for SDK API key authentication
- OAuth2 SSO via Auth0, Google, Microsoft, GitLab (configured by `SSO_OAUTH2_PROVIDER` env var)

### API Conventions

- URI versioning: all routes under `/api/v1/`
- Global response interceptor wraps all responses in a standard format
- Global exception filter for consistent error responses
- Zod validation via NestJS pipes (not class-validator)

## Code Style

- **Formatting**: Prettier with single quotes, 4-space tabs, trailing commas
- **Naming**: Interfaces prefixed with `I` (e.g., `IJwtPayload`). ESLint enforces `PascalCase` for types/classes/enums, `camelCase` for defaults
- **Unused vars**: Prefix with `_` to suppress warnings. Unused imports are errors.
- **no-console**: Warning — use NestJS Logger instead

## Specs & Documentation

Before implementing features, check `docs/specs/`:

- `prd/` — Product Requirements Documents
- `fsd/` — Functional Specification Documents
- `ac/` — Acceptance Criteria
- `test-scenarios/` — Test scenario definitions

API contract lives in `docs/openapi/` (split-file Redocly structure). Database schema in `docs/database/database.dbml`.

any project and technical documentation will be stored in `docs/` with clear subfolders. Use Markdown for text docs and DBML for database diagrams.

## Testing

- **API integration tests**: Plain JS in `tests/scenarios/*.test.js`, using Supertest HTTP client. Config in `tests/config.js` (reads `APP_URL`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD` from env). 30-second timeout.

## Local Development Setup

1. `cp .env.example .env` and configure database credentials
2. `docker compose up -d` — starts Postgres (5432), Redis (6379), Mailpit (SMTP: 1025, UI: 8025)
3. `yarn install && yarn migrate && yarn seed:run:all`
4. `yarn start:dev`

## Key Config Files

- `src/infrastructures/databases/config.ts` — TypeORM DataSource (snake_case naming strategy)
- `src/config.ts` — Central env config accessor
- `nest-cli.json` — Asset compilation for mail templates
