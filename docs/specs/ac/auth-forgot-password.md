# AC: Forgot Password

## Context

A three-step password recovery flow: requesting a reset email (`POST /v1/iam/forgot-password/request`), verifying the token (`POST /v1/iam/forgot-password/verify`), and resetting the password (`POST /v1/iam/forgot-password/reset`). All endpoints are public (no JWT required).

## Acceptance Criteria

### Request Forgot Password

#### Happy Path

- [ ] Given a registered user's email and a valid `redirectUrl`, when calling `POST /v1/iam/forgot-password/request`, then the API returns `200 OK` with message "Request for password reset was successful" and `data: null`.
- [ ] Given a valid request, when the forgot password is requested, then a JWT reset token is generated using `config.jwt.forgotPasswordSecret` with expiry from `config.jwt.forgotPasswordExpiresInSeconds`, stored in `user_tokens` table with type `ForgotPasswordToken`, and an email is queued via `QueueName.Mail` (job `SendMail`) using template `ForgotPassword` containing a link `{redirectUrl}?token={resetToken}`.
- [ ] Given a valid request with `redirectUrl`, when the email is sent, then the reset link in the email follows the format `{redirectUrl}?token={resetToken}`.

#### Validation Errors

- [ ] Given an invalid email format (e.g., "not-an-email"), when calling `POST /v1/iam/forgot-password/request`, then the API returns a Zod validation error.
- [ ] Given an invalid `redirectUrl` (not a valid URL), when calling `POST /v1/iam/forgot-password/request`, then the API returns a Zod validation error.
- [ ] Given a missing `email` field, when calling `POST /v1/iam/forgot-password/request`, then the API returns a Zod validation error.

#### Error Scenarios

- [ ] Given an email that does not belong to any registered user, when calling `POST /v1/iam/forgot-password/request`, then the API returns `401 Unauthorized` with message "User with this email or phone number does not exist".

#### Edge Cases

- [ ] Given a valid request without the optional `redirectUrl` field, when the email is sent, then the reset link becomes `undefined?token={resetToken}` (frontend should always provide this field).

---

### Verify Token

#### Happy Path

- [ ] Given a valid, non-expired JWT reset token that exists in the `user_tokens` table, when calling `POST /v1/iam/forgot-password/verify`, then the API returns `200 OK` with message "Token verification was successful" and `data: null`.

#### Error Scenarios

- [ ] Given an invalid or tampered JWT token, when calling `POST /v1/iam/forgot-password/verify`, then the API returns `401 Unauthorized` with message "Invalid or expired token".
- [ ] Given a valid JWT token that does not exist in the `user_tokens` database table, when calling `POST /v1/iam/forgot-password/verify`, then the API returns `401 Unauthorized` with message "Invalid or expired token".
- [ ] Given a token that has expired in the database (`expiresAt < now`), when calling `POST /v1/iam/forgot-password/verify`, then the API returns `401 Unauthorized` with message "Token expired".
- [ ] Given a valid token whose associated user has been deleted, when calling `POST /v1/iam/forgot-password/verify`, then the API returns `401 Unauthorized` with message "User not found".

#### Edge Cases

- [ ] Given a missing `token` field in the request body, when calling `POST /v1/iam/forgot-password/verify`, then the API returns a Zod validation error.

---

### Reset Password

#### Happy Path

- [ ] Given a valid reset token, a password meeting all requirements, and a matching `confirmPassword`, when calling `POST /v1/iam/forgot-password/reset`, then the API returns `200 OK` with message "Password reset was successful" and `data: null`.
- [ ] Given a successful password reset, when the operation completes, then the user's password is updated via `userV1Repository.updatePassword()` and the reset token is hard-deleted from the database.

#### Validation Errors -- Password Rules

- [ ] Given a password shorter than 8 characters, when calling `POST /v1/iam/forgot-password/reset`, then the API returns a Zod validation error with message `PasswordTooShort(8)`.
- [ ] Given a password that does not match `REGEX.PASSWORD` (must contain uppercase, lowercase, digit, and special character), when calling `POST /v1/iam/forgot-password/reset`, then the API returns a Zod validation error with message `PasswordTooWeak`.
- [ ] Given a `confirmPassword` that does not match `password`, when calling `POST /v1/iam/forgot-password/reset`, then the API returns a Zod validation error with message `PasswordNotMatch` on path `confirmPassword`.
- [ ] Given a missing `token` field, when calling `POST /v1/iam/forgot-password/reset`, then the API returns a Zod validation error.
- [ ] Given a missing `password` field, when calling `POST /v1/iam/forgot-password/reset`, then the API returns a Zod validation error.
- [ ] Given a missing `confirmPassword` field, when calling `POST /v1/iam/forgot-password/reset`, then the API returns a Zod validation error.

#### Error Scenarios

- [ ] Given an invalid or expired JWT reset token, when calling `POST /v1/iam/forgot-password/reset`, then the API returns `401 Unauthorized` with message "Invalid or expired token".
- [ ] Given a valid JWT token that no longer exists in the database (already used), when calling `POST /v1/iam/forgot-password/reset`, then the API returns `401 Unauthorized` with message "Invalid or expired token".

#### Edge Cases

- [ ] Given a token that has already been used to reset a password (hard-deleted from database), when attempting to reset again, then the API returns `401 Unauthorized` because the token record no longer exists.
- [ ] Given all forgot password endpoints, when called, then they respond with HTTP 200 (not 201) due to `@HttpCode(HttpStatus.OK)` decorator override on POST methods.
- [ ] Given all forgot password endpoints, when called, then they are accessible without authentication due to the `@Public()` decorator.
