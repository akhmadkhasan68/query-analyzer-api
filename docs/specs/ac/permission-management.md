# AC: Permission Management

## Context

Read-only endpoints for listing and retrieving permissions in the RBAC system. Each permission is a combination of a Resource and an Operation (e.g., `project.view`, `role.create`). Endpoints: `GET /v1/permissions` (paginate) and `GET /v1/permissions/:permissionId` (detail).

## Acceptance Criteria

### Paginate Permissions (`GET /v1/permissions`)

#### Happy Path

- [ ] Given an authenticated user with `PERMISSION.VIEW` permission, when calling `GET /v1/permissions`, then the API returns `200 OK` with message "Permission pagination retrieved successfully" and paginated data containing `meta` (`page`, `perPage`, `total`, `totalPage`) and `items` array.
- [ ] Given each item in the response, when the data is returned, then it contains `id`, `name`, `slug`, `description`, `resource` (with `id`, `slug`, `name`, `description`), and `operation` (with `id`, `slug`, `name`).
- [ ] Given default query parameters, when calling `GET /v1/permissions` without parameters, then the API defaults to `page=1`, `perPage=10`, `sort=updated_at`, `order=DESC`.
- [ ] Given a `slug` query parameter, when calling `GET /v1/permissions?slug=user-view`, then only permissions matching that slug are returned.
- [ ] Given a `search` query parameter, when calling `GET /v1/permissions?search=user`, then permissions matching the search text are returned.
- [ ] Given custom sorting parameters, when calling `GET /v1/permissions?sort=name&order=ASC`, then results are sorted by name in ascending order.

#### Authorization Failures

- [ ] Given a user without `PERMISSION.VIEW` permission, when calling `GET /v1/permissions`, then the API returns `403 Forbidden`.
- [ ] Given a request without a valid access token, when calling `GET /v1/permissions`, then the API returns `401 Unauthorized`.

#### Validation Errors

- [ ] Given `perPage=0` (less than 1), when calling `GET /v1/permissions`, then the API returns a Zod validation error: "perPage must be at least 1".
- [ ] Given `page=0` (less than 1), when calling `GET /v1/permissions`, then the API returns a Zod validation error: "page must be at least 1".

---

### Get Permission by ID (`GET /v1/permissions/:permissionId`)

#### Happy Path

- [ ] Given a valid `permissionId`, when calling `GET /v1/permissions/:permissionId`, then the API returns `200 OK` with message "Permission retrieved successfully" and the permission data including `resource` and `operation` relations.

#### Error Scenarios

- [ ] Given a `permissionId` that does not exist, when calling `GET /v1/permissions/:permissionId`, then the API returns `404 Not Found` (thrown by `findOrFailByIdWithRelations`).

#### Authorization Failures

- [ ] Given a user without `PERMISSION.VIEW` permission, when calling `GET /v1/permissions/:permissionId`, then the API returns `403 Forbidden`.

#### Edge Cases

- [ ] Given a permission where `resource` or `operation` is null, when the data is returned, then the `resource` and `operation` fields are not included in the response.
