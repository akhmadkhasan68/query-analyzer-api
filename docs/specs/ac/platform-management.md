# AC: Platform Management

## Context

CRUD endpoints for managing platform definitions. Each platform represents a unique combination of framework, ORM provider, and database provider (e.g., NestJS + TypeORM + PostgreSQL). Platforms are referenced by projects to identify the technology stack being monitored. All endpoints require JWT authentication and permission-based access control.

## Acceptance Criteria

### Paginate Platforms (`GET /v1/platforms`)

- [ ] Given a valid JWT token with `PROJECT.VIEW` permission, when a paginate request is sent with no query parameters, then the response is HTTP 200 with default pagination (`page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC`)
- [ ] Given a `framework=NestJS` filter, when a paginate request is sent, then only platforms with framework "NestJS" are returned
- [ ] Given an `ormProvider=TypeORM` filter, when a paginate request is sent, then only platforms with ORM provider "TypeORM" are returned
- [ ] Given a `databaseProvider=PostgreSQL` filter, when a paginate request is sent, then only platforms with database provider "PostgreSQL" are returned
- [ ] Given a `search` parameter, when a paginate request is sent, then matching platforms are returned
- [ ] Given no JWT token, when a paginate request is sent, then the response is HTTP 401 Unauthorized

### Get Platform Detail (`GET /v1/platforms/:id`)

- [ ] Given a valid JWT token with `PROJECT.VIEW` permission and a valid platform ID, when a detail request is sent, then the response is HTTP 200 with platform data including `id`, `framework`, `ormProvider`, and `databaseProvider`
- [ ] Given a platform ID that does not exist, when a detail request is sent, then the response is HTTP 404 Not Found

### Create Platform (`POST /v1/platforms`)

- [ ] Given a valid JWT token with `PROJECT.CREATE` permission and a valid request body with `framework`, `ormProvider`, and `databaseProvider`, when a create request is sent, then the response is HTTP 201 with the created platform data
- [ ] Given the combination of `framework`, `ormProvider`, and `databaseProvider` already exists in the database, when a create request is sent, then the response is HTTP 422 Unprocessable Entity with message "Platform with framework X, orm provider Y and database provider Z already exists"
- [ ] Given the `framework` field is less than 2 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `framework` field exceeds 100 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `ormProvider` field is less than 2 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `ormProvider` field exceeds 100 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `databaseProvider` field is less than 2 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `databaseProvider` field exceeds 100 characters, when a create request is sent, then the response is HTTP 400 Bad Request
- [ ] Given a valid create request, when the platform is created, then the operation runs within a database transaction; if it fails, changes are rolled back

### Update Platform (`PUT /v1/platforms/:id`)

- [ ] Given a valid JWT token with `PROJECT.UPDATE` permission, a valid platform ID, and a valid request body, when an update request is sent, then the response is HTTP 200 with message "Platform updated successfully" (no `data` field in response)
- [ ] Given the updated combination of `framework`, `ormProvider`, and `databaseProvider` already exists for a different platform, when an update request is sent, then the response is HTTP 422 Unprocessable Entity with the duplicate combination message
- [ ] Given a platform ID that does not exist, when an update request is sent, then the response is HTTP 404 Not Found
- [ ] Given duplicate validation passes but the platform ID does not exist, when an update request is sent, then the response is HTTP 404 Not Found (duplicate check runs before existence check)

### Delete Platforms (`DELETE /v1/platforms`)

- [ ] Given a valid JWT token with `PROJECT.DELETE` permission and `ids` containing valid platform IDs, when a delete request is sent, then the response is HTTP 200 with message "Platforms deleted successfully"
- [ ] Given one of the `ids` does not exist in the database, when a delete request is sent, then the response is HTTP 404 Not Found with message "Platform with id {id} not found" and the process is stopped (no platforms are deleted)
- [ ] Given valid platform IDs, when deletion is processed, then all deletions run within a single database transaction; if any fails, all are rolled back
- [ ] Given an empty `ids` array, when a delete request is sent, then the response is HTTP 400 Bad Request
