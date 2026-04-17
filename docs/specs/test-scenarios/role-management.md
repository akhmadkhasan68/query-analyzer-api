# Test Scenarios: Role Management

## Preconditions

- An authenticated user exists with appropriate RBAC permissions (`RESOURCE.ROLE` + `OPERATION.*`)
- One or more permissions exist in the database with known UUIDs
- The database is seeded with test role data for pagination scenarios
- A valid access token is available for authenticated requests

## Scenarios

### Scenario 1: Paginate Roles with Default Parameters

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/roles` with a valid access token (user has `RESOURCE.ROLE` + `OPERATION.VIEW` permission) | API returns `200 OK` with paginated data |
| 2 | Verify response structure | Contains `meta` (`page: 1`, `perPage: 10`, `total`, `totalPages`) and `items` array, each item including `id`, `name`, `slug`, and `permissions` |
| 3 | Verify default sorting | Results are sorted by `updated_at` in `DESC` order |

### Scenario 2: Paginate Roles with Slug Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/roles?slug=admin` | API returns `200 OK` with only roles matching the slug "admin" |

### Scenario 3: Paginate Roles with Search Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/roles?search=editor` | API returns `200 OK` with roles matching the search text "editor" |

### Scenario 4: Paginate Roles Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.ROLE` + `OPERATION.VIEW` permission | Access token obtained |
| 2 | Send `GET /v1/roles` | API returns `403 Forbidden` |

### Scenario 5: Paginate Roles Without Access Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/roles` without an `Authorization` header | API returns `401 Unauthorized` |

### Scenario 6: Get Role by ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/roles/{validRoleId}` with proper authorization | API returns `200 OK` with role data including `permissions` relation (each permission with `id`, `name`, `slug`, `description`, `resource`, `operation`) |

### Scenario 7: Get Role by Non-Existent ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/roles/{nonExistentId}` | API returns `404 Not Found` |

### Scenario 8: Get Role by ID Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.ROLE` + `OPERATION.VIEW` permission | Access token obtained |
| 2 | Send `GET /v1/roles/{validRoleId}` | API returns `403 Forbidden` |

### Scenario 9: Create Role with Valid Data and Permissions

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/roles` with `{ "name": "Senior Editor", "permissionIds": ["{validPermissionId1}", "{validPermissionId2}"] }` | API returns `201 Created` with the created role data |
| 2 | Verify slug auto-generation | `slug` is "senior-editor" (generated via `StringUtil.convertToSlugCase()`) |
| 3 | Verify permissions are assigned | Response includes the assigned `permissions` |
| 4 | Verify transaction | Operation ran within a database transaction |

### Scenario 10: Create Role with Empty Name

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/roles` with `{ "name": "", "permissionIds": ["{validId}"] }` | API returns a Zod validation error (name must be at least 1 character) |

### Scenario 11: Create Role with Empty Permission IDs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/roles` with `{ "name": "Test Role", "permissionIds": [] }` | API returns a Zod validation error (less than 1 item) |

### Scenario 12: Create Role with Invalid Permission ID Format

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/roles` with `{ "name": "Test Role", "permissionIds": ["not-a-uuid"] }` | API returns a Zod validation error |

### Scenario 13: Create Role with Non-Existent Permission IDs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/roles` with `{ "name": "Test Role", "permissionIds": ["{nonExistentUuid}"] }` | API returns a `ZodValidationException` with message "Permission Id not found: {ids}" on path `permissionIds` |

### Scenario 14: Create Role with Slug Conflict (Soft-Deleted Record)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a role with name "Editor" (slug becomes "editor") | Role is created |
| 2 | Soft-delete the role | Role is soft-deleted |
| 3 | Create a new role with name "Editor" | Soft-deleted record's slug is renamed to `editor-{deletedRecordPrefix}` and the new role is created with slug "editor" |

### Scenario 15: Create Role Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.ROLE` + `OPERATION.CREATE` permission | Access token obtained |
| 2 | Send `POST /v1/roles` with valid data | API returns `403 Forbidden` |

### Scenario 16: Update Role Name and Permissions

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/roles/{validRoleId}` with `{ "name": "Lead Editor", "permissionIds": ["{newPermissionId}"] }` | API returns `200 OK` with updated role data |
| 2 | Verify slug is regenerated | `slug` is updated to "lead-editor" |
| 3 | Verify permissions are replaced | Role's permission assignments are replaced within a database transaction |

### Scenario 17: Update Role Name Only (No Permission Change)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/roles/{validRoleId}` with `{ "name": "Updated Name" }` (no `permissionIds`) | API returns `200 OK`; only name/slug are updated, permissions remain unchanged |

### Scenario 18: Update Role with Non-Existent Permission IDs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/roles/{validRoleId}` with `{ "permissionIds": ["{nonExistentUuid}"] }` | API returns a `ZodValidationException` with message "Permission Id not found: {ids}" on path `permissionIds` |

### Scenario 19: Update Non-Existent Role

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/roles/{nonExistentId}` with valid data | API returns `404 Not Found` |

### Scenario 20: Update Role Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.ROLE` + `OPERATION.UPDATE` permission | Access token obtained |
| 2 | Send `PATCH /v1/roles/{validRoleId}` with valid data | API returns `403 Forbidden` |

### Scenario 21: Delete Role Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/roles/{validRoleId}` with proper authorization | API returns `200 OK` with message "Role deleted successfully" and `data: null` |
| 2 | Verify role is soft-deleted | Role record still exists in database with soft-delete flag set |

### Scenario 22: Delete Non-Existent Role

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/roles/{nonExistentId}` | API throws `QueryFailedError` with message "Error, Data not deleted" |

### Scenario 23: Delete Role Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.ROLE` + `OPERATION.DELETE` permission | Access token obtained |
| 2 | Send `DELETE /v1/roles/{validRoleId}` | API returns `403 Forbidden` |

### Scenario 24: Get Role Permissions with Pagination

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/roles/{validRoleId}/permissions` with proper authorization | API returns `200 OK` with paginated permissions belonging to the role |
| 2 | Verify response structure | Contains `meta` and `items` (each item with `id`, `name`, `slug`, `description`, `resource`, `operation`) |

### Scenario 25: Get Role Permissions with Filters

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/roles/{validRoleId}/permissions?search=user&slug=user-view&page=1&perPage=5&sort=name&order=ASC` | API returns filtered and paginated permissions accordingly |

### Scenario 26: Get Permissions for Non-Existent Role

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/roles/{nonExistentId}/permissions` | API returns `404 Not Found` (role existence is validated first) |

### Scenario 27: Get Role Permissions Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.ROLE` + `OPERATION.VIEW` permission | Access token obtained |
| 2 | Send `GET /v1/roles/{validRoleId}/permissions` | API returns `403 Forbidden` |
