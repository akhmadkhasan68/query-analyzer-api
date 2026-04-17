# Test Scenarios: Permission Management

## Preconditions

- An authenticated user exists with `PERMISSION.VIEW` permission
- The database is seeded with permissions (resource + operation combinations)
- A valid access token is available for authenticated requests

## Scenarios

### Scenario 1: Paginate Permissions with Default Parameters

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/permissions` with a valid access token (user has `PERMISSION.VIEW` permission) | API returns `200 OK` with message "Permission pagination retrieved successfully" |
| 2 | Verify response structure | Contains `meta` (`page: 1`, `perPage: 10`, `total`, `totalPage`) and `items` array |
| 3 | Verify each item structure | Each item contains `id`, `name`, `slug`, `description`, `resource` (with `id`, `slug`, `name`, `description`), and `operation` (with `id`, `slug`, `name`) |
| 4 | Verify default sorting | Results are sorted by `updated_at` in `DESC` order |

### Scenario 2: Paginate Permissions with Slug Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/permissions?slug=user-view` | API returns `200 OK` with only permissions matching the slug "user-view" |

### Scenario 3: Paginate Permissions with Search Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/permissions?search=user` | API returns `200 OK` with permissions matching the search text "user" |

### Scenario 4: Paginate Permissions with Custom Sorting

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/permissions?sort=name&order=ASC` | API returns `200 OK` with results sorted by `name` in ascending order |

### Scenario 5: Paginate Permissions with Invalid PerPage

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/permissions?perPage=0` | API returns a Zod validation error: "perPage must be at least 1" |

### Scenario 6: Paginate Permissions with Invalid Page

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/permissions?page=0` | API returns a Zod validation error: "page must be at least 1" |

### Scenario 7: Paginate Permissions Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `PERMISSION.VIEW` permission | Access token obtained |
| 2 | Send `GET /v1/permissions` | API returns `403 Forbidden` |

### Scenario 8: Paginate Permissions Without Access Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/permissions` without an `Authorization` header | API returns `401 Unauthorized` |

### Scenario 9: Get Permission by ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/permissions/{validPermissionId}` with proper authorization | API returns `200 OK` with message "Permission retrieved successfully" and the permission data including `resource` and `operation` relations |

### Scenario 10: Get Permission by Non-Existent ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/permissions/{nonExistentId}` | API returns `404 Not Found` |

### Scenario 11: Get Permission by ID Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `PERMISSION.VIEW` permission | Access token obtained |
| 2 | Send `GET /v1/permissions/{validPermissionId}` | API returns `403 Forbidden` |

### Scenario 12: Get Permission with Null Resource or Operation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Retrieve a permission where `resource` or `operation` is null in the database | Permission has null relations |
| 2 | Send `GET /v1/permissions/{permissionId}` | API returns `200 OK`; the `resource` and `operation` fields are not included in the response |
