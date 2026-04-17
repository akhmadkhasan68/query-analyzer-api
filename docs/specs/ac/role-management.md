# AC: Role Management

## Context

Full CRUD for role management including pagination, role creation with permission assignment, update, soft delete, and listing permissions per role. All endpoints require JWT authentication and appropriate RBAC permissions. Slugs are auto-generated from the role name.

## Acceptance Criteria

### Paginate Roles (`GET /v1/roles`)

#### Happy Path

- [ ] Given an authenticated user with `RESOURCE.ROLE` + `OPERATION.VIEW` permission, when calling `GET /v1/roles`, then the API returns `200 OK` with paginated data containing `meta` (`page`, `perPage`, `total`, `totalPages`) and `items` array, each item including `id`, `name`, `slug`, and `permissions`.
- [ ] Given default query parameters, when calling `GET /v1/roles` without parameters, then the API defaults to `page=1`, `perPage=10`, `sort=updated_at`, `order=DESC`.
- [ ] Given a `slug` query parameter, when calling `GET /v1/roles?slug=admin`, then only roles matching that slug are returned.
- [ ] Given a `search` query parameter, when calling `GET /v1/roles?search=editor`, then roles matching the search text are returned.

#### Authorization Failures

- [ ] Given a user without `RESOURCE.ROLE` + `OPERATION.VIEW` permission, when calling `GET /v1/roles`, then the API returns `403 Forbidden`.
- [ ] Given a request without a valid access token, when calling `GET /v1/roles`, then the API returns `401 Unauthorized`.

---

### Get Role by ID (`GET /v1/roles/:roleId`)

#### Happy Path

- [ ] Given a valid `roleId`, when calling `GET /v1/roles/:roleId`, then the API returns `200 OK` with the role data including `permissions` relation (each permission having `id`, `name`, `slug`, `description`, `resource`, `operation`).

#### Error Scenarios

- [ ] Given a `roleId` that does not exist, when calling `GET /v1/roles/:roleId`, then the API returns `404 Not Found` (via `EntityNotFoundError` / `NotFoundException`).

#### Authorization Failures

- [ ] Given a user without `RESOURCE.ROLE` + `OPERATION.VIEW` permission, when calling `GET /v1/roles/:roleId`, then the API returns `403 Forbidden`.

---

### Create Role (`POST /v1/roles`)

#### Happy Path

- [ ] Given a valid `name` and valid `permissionIds`, when calling `POST /v1/roles`, then the API returns `201 Created` with the created role data including the auto-generated `slug` and assigned `permissions`.
- [ ] Given a role name "Senior Editor", when the role is created, then the `slug` is auto-generated as "senior-editor" using `StringUtil.convertToSlugCase()`.
- [ ] Given valid `permissionIds`, when creating a role, then the operation runs within a database transaction.

#### Validation Errors

- [ ] Given an empty `name` (less than 1 character), when calling `POST /v1/roles`, then the API returns a Zod validation error.
- [ ] Given an empty `permissionIds` array (less than 1 item), when calling `POST /v1/roles`, then the API returns a Zod validation error.
- [ ] Given `permissionIds` containing a non-UUID value, when calling `POST /v1/roles`, then the API returns a Zod validation error.
- [ ] Given `permissionIds` containing IDs that do not exist in the database, when calling `POST /v1/roles`, then the API returns a `ZodValidationException` with message "Permission Id not found: {ids}" on path `permissionIds`.

#### Edge Cases

- [ ] Given a role name that generates a slug matching a previously soft-deleted role's slug, when creating the role, then the soft-deleted record's slug is renamed to `{slug}-{deletedRecordPrefix}` to avoid unique constraint conflicts, and the new role is created successfully.

#### Authorization Failures

- [ ] Given a user without `RESOURCE.ROLE` + `OPERATION.CREATE` permission, when calling `POST /v1/roles`, then the API returns `403 Forbidden`.

---

### Update Role (`PATCH /v1/roles/:roleId`)

#### Happy Path

- [ ] Given valid update data with `name` and/or `permissionIds`, when calling `PATCH /v1/roles/:roleId`, then the API returns `200 OK` with updated role data.
- [ ] Given a `name` update, when the role is updated, then the `slug` is regenerated from the new name.
- [ ] Given `permissionIds` in the update body, when updating, then the role's permission assignments are replaced within a database transaction.
- [ ] Given an update without `permissionIds`, when calling `PATCH /v1/roles/:roleId`, then only the name/slug are updated and permissions remain unchanged.

#### Validation Errors

- [ ] Given `permissionIds` containing IDs that do not exist in the database, when calling `PATCH /v1/roles/:roleId`, then the API returns a `ZodValidationException` with message "Permission Id not found: {ids}" on path `permissionIds`.

#### Error Scenarios

- [ ] Given a `roleId` that does not exist, when calling `PATCH /v1/roles/:roleId`, then the API returns `404 Not Found`.

#### Authorization Failures

- [ ] Given a user without `RESOURCE.ROLE` + `OPERATION.UPDATE` permission, when calling `PATCH /v1/roles/:roleId`, then the API returns `403 Forbidden`.

---

### Delete Role (`DELETE /v1/roles/:roleId`)

#### Happy Path

- [ ] Given a valid `roleId`, when calling `DELETE /v1/roles/:roleId`, then the API returns `200 OK` with message "Role deleted successfully" and `data: null`.
- [ ] Given a successful delete, when the operation completes, then the role is soft-deleted (not hard-deleted).

#### Error Scenarios

- [ ] Given a `roleId` that does not exist or the delete affects 0 rows, when calling `DELETE /v1/roles/:roleId`, then the API throws `QueryFailedError` with message "Error, Data not deleted".

#### Authorization Failures

- [ ] Given a user without `RESOURCE.ROLE` + `OPERATION.DELETE` permission, when calling `DELETE /v1/roles/:roleId`, then the API returns `403 Forbidden`.

---

### Get Role Permissions (`GET /v1/roles/:roleId/permissions`)

#### Happy Path

- [ ] Given a valid `roleId`, when calling `GET /v1/roles/:roleId/permissions`, then the API returns `200 OK` with paginated permissions belonging to the role, including `meta` and `items` (each item with `id`, `name`, `slug`, `description`, `resource`, `operation`).
- [ ] Given pagination and filter parameters (`page`, `perPage`, `sort`, `order`, `search`, `slug`), when calling `GET /v1/roles/:roleId/permissions`, then the results are filtered and paginated accordingly.

#### Error Scenarios

- [ ] Given a `roleId` that does not exist, when calling `GET /v1/roles/:roleId/permissions`, then the API returns `404 Not Found` (role existence is validated first).

#### Authorization Failures

- [ ] Given a user without `RESOURCE.ROLE` + `OPERATION.VIEW` permission, when calling `GET /v1/roles/:roleId/permissions`, then the API returns `403 Forbidden`.
