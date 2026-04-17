# AC: Authentication Session Management

## Context

Endpoints for user session management: retrieving the currently logged-in user's information (`GET /v1/iam/auth/me`), refreshing an access token using a refresh token (`POST /v1/iam/auth/refresh-token`), and logging out by invalidating all refresh tokens (`DELETE /v1/iam/auth/logout`).

## Acceptance Criteria

### Get Current User (Me)

#### Happy Path

- [ ] Given an authenticated user with a valid access token, when they call `GET /v1/iam/auth/me`, then the API returns `200 OK` with the user's `id`, `fullname`, `email`, `phoneNumber`, and `roles` (including nested `permissions` for each role).
- [ ] Given an authenticated user with multiple roles, when they call `GET /v1/iam/auth/me`, then all assigned roles and their permissions are included in the response.

#### Authorization Failures

- [ ] Given a request without an `Authorization` header, when calling `GET /v1/iam/auth/me`, then the API returns `401 Unauthorized` with message "Unauthorized".
- [ ] Given a request with an expired access token, when calling `GET /v1/iam/auth/me`, then the API returns `401 Unauthorized` with message "Unauthorized".
- [ ] Given a request with a malformed or invalid JWT, when calling `GET /v1/iam/auth/me`, then the API returns `401 Unauthorized` with message "Unauthorized".

#### Edge Cases

- [ ] Given a user whose account was soft-deleted after the access token was issued, when they call `GET /v1/iam/auth/me`, then the API returns `401 Unauthorized` with message "Unauthorized" because the user is not found in the database.
- [ ] Given a request using a refresh token instead of an access token, when calling `GET /v1/iam/auth/me`, then the API returns `401 Unauthorized` because the JWT strategy expects an access token payload containing `id`, `fullname`, `email`.

---

### Refresh Token

#### Happy Path

- [ ] Given a valid, non-expired refresh token, when calling `POST /v1/iam/auth/refresh-token` with the refresh token in the `Authorization: Bearer` header, then the API returns `200 OK` with a new `accessToken`, the original `refreshToken` (unchanged), user data, and expiration timestamps in ISO 8601 format.
- [ ] Given a valid refresh token, when the access token is refreshed, then the returned `refreshTokenExpiresIn` matches the original expiration time (the refresh token is not rotated).

#### Authorization Failures

- [ ] Given an expired refresh token, when calling `POST /v1/iam/auth/refresh-token`, then the API returns `401 Unauthorized` with message "Refresh token expired".
- [ ] Given a refresh token that does not exist in the `user_tokens` database table, when calling `POST /v1/iam/auth/refresh-token`, then the API returns `401 Unauthorized`.
- [ ] Given a request without an `Authorization` header, when calling `POST /v1/iam/auth/refresh-token`, then the API returns `401 Unauthorized`.

#### Edge Cases

- [ ] Given a refresh token whose associated user has been deleted, when calling `POST /v1/iam/auth/refresh-token`, then the API returns `401 Unauthorized` with message "User not found".
- [ ] Given a refresh token that was soft-deleted (e.g., after logout), when calling `POST /v1/iam/auth/refresh-token`, then the API returns `401 Unauthorized`.
- [ ] Given the refresh token endpoint, when a request is made, then it uses `JwtRefreshAuthGuard` (via `@ExcludeGlobalGuard()` and `@UseGuards(JwtRefreshAuthGuard)`) instead of the global JWT access token guard.
- [ ] Given a valid refresh token, when refreshing, then the token expiry is validated both in `JwtRefreshStrategy.validate()` and again in `IamAuthV1Service.refreshToken()` by checking `expiresAt < new Date()`.

---

### Logout

#### Happy Path

- [ ] Given an authenticated user with one or more refresh tokens, when calling `DELETE /v1/iam/auth/logout`, then the API returns `200 OK` with `data: null` and message "Logout successful", and all the user's refresh tokens are soft-deleted.
- [ ] Given an authenticated user with no active refresh tokens, when calling `DELETE /v1/iam/auth/logout`, then the API still returns `200 OK` with `data: null` and message "Logout successful" (no error thrown).

#### Authorization Failures

- [ ] Given a request without a valid access token, when calling `DELETE /v1/iam/auth/logout`, then the API returns `401 Unauthorized`.

#### Edge Cases

- [ ] Given an authenticated user, when they log out, then the refresh tokens are soft-deleted (not hard-deleted) from the `user_tokens` table.
- [ ] Given an authenticated user who logs out, when they subsequently attempt to use a previously valid refresh token, then the refresh token is no longer found and the API returns `401 Unauthorized`.
