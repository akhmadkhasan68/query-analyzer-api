# AC: User Management

## Context

Full CRUD for user management including pagination with filters, user creation with role assignment, profile update, password update, and soft delete. All endpoints require JWT authentication and appropriate RBAC permissions.

## Acceptance Criteria

### Paginate Users (`GET /v1/users`)

#### Happy Path

- [ ] Given an authenticated user with `RESOURCE.USER` + `OPERATION.VIEW` permission, when calling `GET /v1/users`, then the API returns `200 OK` with paginated data containing `meta` (`page`, `perPage`, `total`, `totalPages`) and `items` array.
- [ ] Given default query parameters, when calling `GET /v1/users` without parameters, then the API defaults to `page=1`, `perPage=10`, `sort=updated_at`, `order=DESC`.
- [ ] Given a `search` query parameter, when calling `GET /v1/users?search=john`, then the API returns users matching the search text.
- [ ] Given `emailVerfied=true` filter, when calling `GET /v1/users?emailVerfied=true`, then only users with verified emails are returned.
- [ ] Given `phoneNumberVerified=true` filter, when calling `GET /v1/users?phoneNumberVerified=true`, then only users with verified phone numbers are returned.
- [ ] Given custom pagination parameters, when calling `GET /v1/users?page=2&perPage=5&sort=fullname&order=ASC`, then results are sorted and paginated accordingly.

#### Authorization Failures

- [ ] Given a user without `RESOURCE.USER` + `OPERATION.VIEW` permission, when calling `GET /v1/users`, then the API returns `403 Forbidden`.
- [ ] Given a request without a valid access token, when calling `GET /v1/users`, then the API returns `401 Unauthorized`.

#### Validation Errors

- [ ] Given `page=0` (less than 1), when calling `GET /v1/users`, then the API returns a Zod validation error.
- [ ] Given `perPage=0` (less than 1), when calling `GET /v1/users`, then the API returns a Zod validation error.

---

### Create User (`POST /v1/users`)

#### Happy Path

- [ ] Given valid user data with `fullname`, `email`, `password`, `phoneNumber`, and valid `roleIds`, when calling `POST /v1/users`, then the API returns `201 Created` with the created user data including assigned roles.
- [ ] Given valid user data, when a user is created, then the password is automatically hashed before storage (via entity hook/subscriber).
- [ ] Given valid `roleIds`, when creating a user, then the operation runs within a database transaction (connect, start, commit/rollback, release).

#### Validation Errors

- [ ] Given an empty `fullname` (less than 1 character), when calling `POST /v1/users`, then the API returns a Zod validation error.
- [ ] Given an invalid email format, when calling `POST /v1/users`, then the API returns a Zod validation error.
- [ ] Given a password shorter than 8 characters, when calling `POST /v1/users`, then the API returns a Zod validation error with `PasswordTooShort(8)`.
- [ ] Given a password that does not match `REGEX.PASSWORD` (must contain uppercase, lowercase, digit, special character), when calling `POST /v1/users`, then the API returns a Zod validation error with `PasswordTooWeak`.
- [ ] Given a `phoneNumber` that does not match `REGEX.PHONE_NUMBER_ID` (Indonesian phone number format), when calling `POST /v1/users`, then the API returns a Zod validation error.
- [ ] Given a non-numeric `phoneNumber`, when calling `POST /v1/users`, then the API returns a Zod validation error.
- [ ] Given an empty `roleIds` array (less than 1 item), when calling `POST /v1/users`, then the API returns a Zod validation error.
- [ ] Given `roleIds` containing a non-UUID value, when calling `POST /v1/users`, then the API returns a Zod validation error.
- [ ] Given `roleIds` containing IDs that do not exist in the database, when calling `POST /v1/users`, then the API returns a `ZodValidationException` with message "Role Id not found: {ids}" on path `roleIds`.

#### Error Scenarios

- [ ] Given a duplicate `email` that already exists in the database, when calling `POST /v1/users`, then the API returns a database constraint error.
- [ ] Given a duplicate `phoneNumber` that already exists in the database, when calling `POST /v1/users`, then the API returns a database constraint error.

#### Authorization Failures

- [ ] Given a user without `RESOURCE.USER` + `OPERATION.CREATE` permission, when calling `POST /v1/users`, then the API returns `403 Forbidden`.

---

### Get User by ID (`GET /v1/users/:userId`)

#### Happy Path

- [ ] Given a valid `userId`, when calling `GET /v1/users/:userId`, then the API returns `200 OK` with user data including `roles` and `roles.permissions` relations.

#### Error Scenarios

- [ ] Given a `userId` that does not exist, when calling `GET /v1/users/:userId`, then the API returns `404 Not Found` (via `EntityNotFoundError` / `NotFoundException`).

#### Authorization Failures

- [ ] Given a user without `RESOURCE.USER` + `OPERATION.VIEW` permission, when calling `GET /v1/users/:userId`, then the API returns `403 Forbidden`.

---

### Update User (`PATCH /v1/users/:userId`)

#### Happy Path

- [ ] Given valid update data (`fullname`, `email`, `phoneNumber`), when calling `PATCH /v1/users/:userId`, then the API returns `200 OK` with updated user data.
- [ ] Given valid `roleIds` in the update body, when calling `PATCH /v1/users/:userId`, then the user's role assignments are updated within a database transaction.
- [ ] Given an update without `roleIds`, when calling `PATCH /v1/users/:userId`, then only the profile fields are updated and roles remain unchanged.

#### Validation Errors

- [ ] Given an invalid email format in the update body, when calling `PATCH /v1/users/:userId`, then the API returns a Zod validation error.
- [ ] Given a `phoneNumber` not matching `REGEX.PHONE_NUMBER_ID`, when calling `PATCH /v1/users/:userId`, then the API returns a Zod validation error.
- [ ] Given `roleIds` containing IDs that do not exist in the database, when calling `PATCH /v1/users/:userId`, then the API returns a `ZodValidationException` with message "Role Id not found: {ids}" on path `roleIds`.

#### Error Scenarios

- [ ] Given a `userId` that does not exist, when calling `PATCH /v1/users/:userId`, then the API returns `404 Not Found`.

#### Authorization Failures

- [ ] Given a user without `RESOURCE.USER` + `OPERATION.UPDATE` permission, when calling `PATCH /v1/users/:userId`, then the API returns `403 Forbidden`.

---

### Update User Password (`PATCH /v1/users/:userId/password`)

#### Happy Path

- [ ] Given a valid `newPassword` meeting all password requirements, when calling `PATCH /v1/users/:userId/password`, then the API returns `200 OK` with message "User update password Successfully" and the user data.
- [ ] Given the update password endpoint, when called, then it does not require the old/current password (designed for admin password reset).

#### Validation Errors

- [ ] Given a `newPassword` shorter than 8 characters, when calling `PATCH /v1/users/:userId/password`, then the API returns a Zod validation error with `PasswordTooShort(8)`.
- [ ] Given a `newPassword` not matching `REGEX.PASSWORD`, when calling `PATCH /v1/users/:userId/password`, then the API returns a Zod validation error with `PasswordTooWeak`.

#### Error Scenarios

- [ ] Given a `userId` that does not exist, when calling `PATCH /v1/users/:userId/password`, then the API returns `404 Not Found`.

#### Authorization Failures

- [ ] Given a user without `RESOURCE.USER` + `OPERATION.UPDATE` permission, when calling `PATCH /v1/users/:userId/password`, then the API returns `403 Forbidden`.

---

### Delete User (`DELETE /v1/users/:userId`)

#### Happy Path

- [ ] Given a valid `userId`, when calling `DELETE /v1/users/:userId`, then the API returns `200 OK` with message "User deleted successfully" and `data: null`.
- [ ] Given a successful delete, when the operation completes, then the user is soft-deleted (not hard-deleted).

#### Error Scenarios

- [ ] Given a `userId` that does not exist or delete affects 0 rows, when calling `DELETE /v1/users/:userId`, then the API throws `QueryFailedError` with message "Error, Data not deleted".

#### Authorization Failures

- [ ] Given a user without `RESOURCE.USER` + `OPERATION.DELETE` permission, when calling `DELETE /v1/users/:userId`, then the API returns `403 Forbidden`.
