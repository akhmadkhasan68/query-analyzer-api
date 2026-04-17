# Test Scenarios: Platform Management

## Preconditions

- A valid JWT token is available for an authenticated user with appropriate permissions (`PROJECT.VIEW`, `PROJECT.CREATE`, `PROJECT.UPDATE`, `PROJECT.DELETE`)
- The endpoints are available at `GET /v1/platforms`, `GET /v1/platforms/:id`, `POST /v1/platforms`, `PUT /v1/platforms/:id`, `DELETE /v1/platforms`

## Scenarios

### Scenario 1: Create Platform - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/platforms` with `framework: "NestJS"`, `ormProvider: "TypeORM"`, `databaseProvider: "PostgreSQL"` | Valid create request |
| 2 | Verify the response | Response is HTTP 201 with created platform data including `id`, `framework`, `ormProvider`, `databaseProvider` |

### Scenario 2: Create Platform - Duplicate Combination Rejection

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a platform with `framework: "NestJS"`, `ormProvider: "TypeORM"`, `databaseProvider: "PostgreSQL"` | Platform created |
| 2 | Send `POST /v1/platforms` with the same combination | Duplicate combination |
| 3 | Observe the response | Response is HTTP 422 Unprocessable Entity with message "Platform with framework NestJS, orm provider TypeORM and database provider PostgreSQL already exists" |

### Scenario 3: Create Platform - Field Validation (Too Short)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/platforms` with `framework: "N"` (1 character) | Framework too short |
| 2 | Observe the response | Response is HTTP 400 Bad Request |
| 3 | Send with `ormProvider: "T"` (1 character) | ORM provider too short |
| 4 | Observe the response | Response is HTTP 400 Bad Request |
| 5 | Send with `databaseProvider: "P"` (1 character) | Database provider too short |
| 6 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 4: Create Platform - Field Validation (Too Long)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/platforms` with `framework` exceeding 100 characters | Framework too long |
| 2 | Observe the response | Response is HTTP 400 Bad Request |
| 3 | Send with `ormProvider` exceeding 100 characters | ORM provider too long |
| 4 | Observe the response | Response is HTTP 400 Bad Request |
| 5 | Send with `databaseProvider` exceeding 100 characters | Database provider too long |
| 6 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 5: Create Platform - Transaction Rollback on Failure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate a failure during the platform creation transaction | Operation fails |
| 2 | Verify the database | No partial data exists; changes are rolled back |

### Scenario 6: Paginate Platforms - Default Pagination

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/platforms` with no query parameters | Default pagination |
| 2 | Verify the response | Response is HTTP 200 with defaults `page: 1`, `perPage: 10`, `sort: updated_at`, `order: DESC` |

### Scenario 7: Paginate Platforms - Filter by Framework

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/platforms?framework=NestJS` | Framework filter applied |
| 2 | Verify the response | Only platforms with framework "NestJS" are returned |

### Scenario 8: Paginate Platforms - Filter by ORM Provider

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/platforms?ormProvider=TypeORM` | ORM provider filter applied |
| 2 | Verify the response | Only platforms with ORM provider "TypeORM" are returned |

### Scenario 9: Paginate Platforms - Filter by Database Provider

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/platforms?databaseProvider=PostgreSQL` | Database provider filter applied |
| 2 | Verify the response | Only platforms with database provider "PostgreSQL" are returned |

### Scenario 10: Paginate Platforms - Search

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/platforms?search=Nest` | Search keyword provided |
| 2 | Verify the response | Matching platforms are returned |

### Scenario 11: Paginate Platforms - No JWT Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/platforms` without a JWT token | No authentication |
| 2 | Observe the response | Response is HTTP 401 Unauthorized |

### Scenario 12: Get Platform Detail - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/platforms/:id` with a valid platform ID | Valid ID |
| 2 | Verify the response | Response is HTTP 200 with platform data including `id`, `framework`, `ormProvider`, `databaseProvider` |

### Scenario 13: Get Platform Detail - Non-Existent ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/platforms/:id` with a non-existent UUID | Invalid ID |
| 2 | Observe the response | Response is HTTP 404 Not Found |

### Scenario 14: Update Platform - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PUT /v1/platforms/:id` with `framework: "Express"`, `ormProvider: "Prisma"`, `databaseProvider: "MySQL"` | Valid update request |
| 2 | Verify the response | Response is HTTP 200 with message "Platform updated successfully" (no `data` field) |

### Scenario 15: Update Platform - Duplicate Combination for Different Platform

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create Platform A: `NestJS / TypeORM / PostgreSQL` | Platform A exists |
| 2 | Create Platform B: `Express / Prisma / MySQL` | Platform B exists |
| 3 | Send `PUT /v1/platforms/:idB` with `framework: "NestJS"`, `ormProvider: "TypeORM"`, `databaseProvider: "PostgreSQL"` | Update B to match A's combination |
| 4 | Observe the response | Response is HTTP 422 Unprocessable Entity with duplicate combination message |

### Scenario 16: Update Platform - Non-Existent ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PUT /v1/platforms/:id` with a non-existent UUID | Invalid ID |
| 2 | Observe the response | Response is HTTP 404 Not Found |

### Scenario 17: Delete Platforms - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create two platforms | Two platforms available |
| 2 | Send `DELETE /v1/platforms` with `ids` containing both platform IDs | Valid bulk delete |
| 3 | Verify the response | Response is HTTP 200 with message "Platforms deleted successfully" |
| 4 | Verify the database | Both platforms are removed within a single transaction |

### Scenario 18: Delete Platforms - One ID Not Found

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/platforms` with `ids` containing one valid and one non-existent UUID | Mixed valid and invalid IDs |
| 2 | Observe the response | Response is HTTP 404 Not Found with message "Platform with id {id} not found"; no platforms are deleted |

### Scenario 19: Delete Platforms - Transaction Rollback

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate a failure during the deletion transaction | Transaction error |
| 2 | Verify the database | All deletions are rolled back; no data is removed |

### Scenario 20: Delete Platforms - Empty IDs Array

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/platforms` with `ids: []` | Empty array |
| 2 | Observe the response | Response is HTTP 400 Bad Request |
