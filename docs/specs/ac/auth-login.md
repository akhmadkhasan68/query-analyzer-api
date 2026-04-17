# AC: Authentication Login

## Context

Public endpoint (`POST /v1/iam/auth/login`) for authenticating users with email/phone number and password. Returns a JWT access token and refresh token upon successful authentication. The endpoint uses the `@Public()` decorator so no JWT is required. The `email` field can accept either an email address or a phone number for lookup.

## Acceptance Criteria

### Happy Path

- [ ] Given a valid registered email and correct password, when a login request is sent, then the response is HTTP 200 with `message: "Authentication successful"` and `data` containing `user` and `token` objects
- [ ] Given a valid registered phone number in the `email` field and correct password, when a login request is sent, then the response is HTTP 200 with successful authentication (lookup uses `findOneByEmailOrPhoneNumber`)
- [ ] Given a successful login, when inspecting the `user` object, then it includes `id`, `fullname`, `email`, `phoneNumber`, and `roles` with nested `permissions` (each containing `resource` and `operation`)
- [ ] Given a successful login, when inspecting the `token` object, then it includes `accessToken` (JWT string), `accessTokenExpiresIn` (ISO 8601 datetime), `refreshToken` (JWT string), and `refreshTokenExpiresIn` (ISO 8601 datetime)
- [ ] Given a successful login, when inspecting the JWT access token payload, then it contains `id`, `fullname`, and `email` claims
- [ ] Given a successful login, when checking the database, then a refresh token record is saved in `user_tokens` with type `RefreshToken`, a UUID-based ID, and an expiration time based on `config.jwt.refreshTokenExpiresInSeconds`

### Authentication Failures

- [ ] Given an email that does not exist in the database, when a login request is sent, then the response is HTTP 401 Unauthorized with message "Invalid credentials"
- [ ] Given a valid email but an incorrect password, when a login request is sent, then the response is HTTP 401 Unauthorized with message "Invalid credentials"
- [ ] Given a phone number that does not exist in the database (in the `email` field), when a login request is sent, then the response is HTTP 401 Unauthorized with message "Invalid credentials"
- [ ] Given an incorrect password, when comparing the error message with the non-existent email error message, then both return the same "Invalid credentials" message (no information leakage about whether the account exists)

### Validation Errors

- [ ] Given the `email` field is missing from the request body, when a login request is sent, then the response is HTTP 400 Bad Request
- [ ] Given the `password` field is missing from the request body, when a login request is sent, then the response is HTTP 400 Bad Request
- [ ] Given both `email` and `password` fields are missing, when a login request is sent, then the response is HTTP 400 Bad Request

### Security & Edge Cases

- [ ] Given the endpoint is decorated with `@Public()`, when a request is sent without any JWT token, then the request is accepted and processed normally (no 401 from global guard)
- [ ] Given a bcrypt-hashed password in the database, when the password is verified, then `HashUtil.compareHashBcrypt` is used for secure comparison
- [ ] Given a successful login generates a refresh token, when checking the token storage, then the refresh token JWT and its UUID-based record ID are both persisted
