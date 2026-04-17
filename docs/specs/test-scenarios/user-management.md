# Test Scenarios: User Management

## Preconditions

- An authenticated user exists with appropriate RBAC permissions (`RESOURCE.USER` + `OPERATION.*`)
- One or more roles exist in the database with known UUIDs
- The database is seeded with test user data for pagination scenarios
- A valid access token is available for authenticated requests

## Scenarios

### Scenario 1: Paginate Users with Default Parameters

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users` with a valid access token (user has `RESOURCE.USER` + `OPERATION.VIEW` permission) | API returns `200 OK` with paginated data |
| 2 | Verify response structure | Contains `meta` (`page: 1`, `perPage: 10`, `total`, `totalPages`) and `items` array |
| 3 | Verify default sorting | Results are sorted by `updated_at` in `DESC` order |

### Scenario 2: Paginate Users with Custom Parameters

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users?page=2&perPage=5&sort=fullname&order=ASC` | API returns `200 OK` |
| 2 | Verify pagination | Page 2 with 5 items per page, sorted by `fullname` ascending |

### Scenario 3: Paginate Users with Search Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users?search=john` | API returns `200 OK` with users matching "john" in the search |

### Scenario 4: Paginate Users with Email Verified Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users?emailVerfied=true` | API returns `200 OK` with only users who have verified emails |

### Scenario 5: Paginate Users with Phone Number Verified Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users?phoneNumberVerified=true` | API returns `200 OK` with only users who have verified phone numbers |

### Scenario 6: Paginate Users with Invalid Page Parameter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users?page=0` | API returns a Zod validation error (page must be at least 1) |

### Scenario 7: Paginate Users with Invalid PerPage Parameter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users?perPage=0` | API returns a Zod validation error (perPage must be at least 1) |

### Scenario 8: Paginate Users Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.USER` + `OPERATION.VIEW` permission | Access token obtained |
| 2 | Send `GET /v1/users` | API returns `403 Forbidden` |

### Scenario 9: Paginate Users Without Access Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users` without an `Authorization` header | API returns `401 Unauthorized` |

### Scenario 10: Create User with Valid Data and Roles

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users` with `{ "fullname": "John Doe", "email": "john@example.com", "password": "Pass@1234", "phoneNumber": "081234567890", "roleIds": ["{validRoleId}"] }` | API returns `201 Created` with the created user data including assigned roles |
| 2 | Verify password is hashed | Stored password is not in plain text |
| 3 | Verify transaction | Operation ran within a database transaction |

### Scenario 11: Create User with Invalid Email

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users` with `"email": "not-an-email"` | API returns a Zod validation error |

### Scenario 12: Create User with Short Password

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users` with `"password": "Ab@1"` (less than 8 characters) | API returns a Zod validation error with `PasswordTooShort(8)` |

### Scenario 13: Create User with Weak Password

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users` with `"password": "simplepassword"` (missing uppercase, digit, special char) | API returns a Zod validation error with `PasswordTooWeak` |

### Scenario 14: Create User with Invalid Phone Number

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users` with `"phoneNumber": "abc123"` (non-numeric) | API returns a Zod validation error |
| 2 | Send `POST /v1/users` with `"phoneNumber": "1234567890"` (not matching Indonesian format) | API returns a Zod validation error |

### Scenario 15: Create User with Empty Role IDs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users` with `"roleIds": []` | API returns a Zod validation error (less than 1 item) |

### Scenario 16: Create User with Invalid Role ID Format

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users` with `"roleIds": ["not-a-uuid"]` | API returns a Zod validation error |

### Scenario 17: Create User with Non-Existent Role IDs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users` with `"roleIds": ["{nonExistentUuid}"]` | API returns a `ZodValidationException` with message "Role Id not found: {ids}" on path `roleIds` |

### Scenario 18: Create User with Duplicate Email

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a user with email "existing@example.com" | User is created |
| 2 | Send `POST /v1/users` with the same email "existing@example.com" | API returns a database constraint error |

### Scenario 19: Create User with Duplicate Phone Number

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a user with phone "081234567890" | User is created |
| 2 | Send `POST /v1/users` with the same phone number "081234567890" | API returns a database constraint error |

### Scenario 20: Create User Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.USER` + `OPERATION.CREATE` permission | Access token obtained |
| 2 | Send `POST /v1/users` with valid data | API returns `403 Forbidden` |

### Scenario 21: Create User with Empty Fullname

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users` with `"fullname": ""` | API returns a Zod validation error (less than 1 character) |

### Scenario 22: Get User by ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/{validUserId}` with proper authorization | API returns `200 OK` with user data including `roles` and `roles.permissions` relations |

### Scenario 23: Get User by Non-Existent ID

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/{nonExistentId}` | API returns `404 Not Found` |

### Scenario 24: Get User by ID Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.USER` + `OPERATION.VIEW` permission | Access token obtained |
| 2 | Send `GET /v1/users/{validUserId}` | API returns `403 Forbidden` |

### Scenario 25: Update User Profile

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{validUserId}` with `{ "fullname": "Jane Doe", "email": "jane@example.com", "phoneNumber": "081987654321" }` | API returns `200 OK` with updated user data |

### Scenario 26: Update User Roles

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{validUserId}` with `{ "roleIds": ["{newRoleId}"] }` | API returns `200 OK` with updated role assignments |
| 2 | Verify transaction | Role update ran within a database transaction |

### Scenario 27: Update User Without Roles (Profile Only)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{validUserId}` with `{ "fullname": "Updated Name" }` (no `roleIds`) | API returns `200 OK`; roles remain unchanged |

### Scenario 28: Update User with Invalid Email

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{validUserId}` with `"email": "invalid"` | API returns a Zod validation error |

### Scenario 29: Update User with Invalid Phone Number

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{validUserId}` with `"phoneNumber": "invalid"` | API returns a Zod validation error |

### Scenario 30: Update User with Non-Existent Role IDs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{validUserId}` with `"roleIds": ["{nonExistentUuid}"]` | API returns a `ZodValidationException` with message "Role Id not found: {ids}" on path `roleIds` |

### Scenario 31: Update Non-Existent User

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{nonExistentId}` with valid data | API returns `404 Not Found` |

### Scenario 32: Update User Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.USER` + `OPERATION.UPDATE` permission | Access token obtained |
| 2 | Send `PATCH /v1/users/{validUserId}` with valid data | API returns `403 Forbidden` |

### Scenario 33: Update User Password Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{validUserId}/password` with `{ "newPassword": "NewPass@123" }` | API returns `200 OK` with message "User update password Successfully" and the user data |
| 2 | Verify old password is not required | Endpoint does not require old/current password (admin password reset) |

### Scenario 34: Update User Password with Short Password

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{validUserId}/password` with `{ "newPassword": "Ab@1" }` | API returns a Zod validation error with `PasswordTooShort(8)` |

### Scenario 35: Update User Password with Weak Password

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{validUserId}/password` with `{ "newPassword": "weakpassword" }` | API returns a Zod validation error with `PasswordTooWeak` |

### Scenario 36: Update Password for Non-Existent User

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `PATCH /v1/users/{nonExistentId}/password` with valid password | API returns `404 Not Found` |

### Scenario 37: Update Password Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.USER` + `OPERATION.UPDATE` permission | Access token obtained |
| 2 | Send `PATCH /v1/users/{validUserId}/password` with valid password | API returns `403 Forbidden` |

### Scenario 38: Delete User Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/users/{validUserId}` with proper authorization | API returns `200 OK` with message "User deleted successfully" and `data: null` |
| 2 | Verify user is soft-deleted | User record still exists in database with soft-delete flag set |

### Scenario 39: Delete Non-Existent User

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/users/{nonExistentId}` | API throws `QueryFailedError` with message "Error, Data not deleted" |

### Scenario 40: Delete User Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.USER` + `OPERATION.DELETE` permission | Access token obtained |
| 2 | Send `DELETE /v1/users/{validUserId}` | API returns `403 Forbidden` |
