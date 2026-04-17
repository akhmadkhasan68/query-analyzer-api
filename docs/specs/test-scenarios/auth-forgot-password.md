# Test Scenarios: Forgot Password

## Preconditions

- A registered user exists in the database with a known email address
- The mail queue (`QueueName.Mail`) is operational
- The `ForgotPassword` email template is configured
- JWT forgot password secret and expiry are configured in `config.jwt`

## Scenarios

### Scenario 1: Request Password Reset Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/request` with `{ "email": "user@example.com", "redirectUrl": "https://app.example.com/reset" }` | API returns `200 OK` with message "Request for password reset was successful" and `data: null` |
| 2 | Verify a JWT reset token is generated and stored in `user_tokens` table with type `ForgotPasswordToken` | Token record exists with correct expiry |
| 3 | Verify an email is queued via `QueueName.Mail` (job `SendMail`) using template `ForgotPassword` | Email job is enqueued |
| 4 | Verify the email contains a link in the format `{redirectUrl}?token={resetToken}` | Link format is `https://app.example.com/reset?token={resetToken}` |

### Scenario 2: Request Reset with Invalid Email Format

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/request` with `{ "email": "not-an-email", "redirectUrl": "https://app.example.com/reset" }` | API returns a Zod validation error |

### Scenario 3: Request Reset with Invalid Redirect URL

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/request` with `{ "email": "user@example.com", "redirectUrl": "not-a-url" }` | API returns a Zod validation error |

### Scenario 4: Request Reset with Missing Email Field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/request` with `{ "redirectUrl": "https://app.example.com/reset" }` | API returns a Zod validation error |

### Scenario 5: Request Reset with Unregistered Email

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/request` with `{ "email": "unknown@example.com", "redirectUrl": "https://app.example.com/reset" }` | API returns `401 Unauthorized` with message "User with this email or phone number does not exist" |

### Scenario 6: Request Reset Without Optional redirectUrl

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/request` with `{ "email": "user@example.com" }` | API returns `200 OK` with message "Request for password reset was successful" |
| 2 | Verify the reset link in the email | Link becomes `undefined?token={resetToken}` |

### Scenario 7: Verify Valid Reset Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Request a password reset and obtain the reset token | Token is generated and stored |
| 2 | Send `POST /v1/iam/forgot-password/verify` with `{ "token": "{resetToken}" }` | API returns `200 OK` with message "Token verification was successful" and `data: null` |

### Scenario 8: Verify Invalid or Tampered Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/verify` with `{ "token": "invalid.tampered.token" }` | API returns `401 Unauthorized` with message "Invalid or expired token" |

### Scenario 9: Verify Token Not Found in Database

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Generate a valid JWT token using the forgot password secret but do not store it in `user_tokens` | Token is valid JWT but not in database |
| 2 | Send `POST /v1/iam/forgot-password/verify` with this token | API returns `401 Unauthorized` with message "Invalid or expired token" |

### Scenario 10: Verify Expired Token (Database Expiry)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Use a token whose `expiresAt` in the database is in the past | Token record has `expiresAt < now` |
| 2 | Send `POST /v1/iam/forgot-password/verify` with this token | API returns `401 Unauthorized` with message "Token expired" |

### Scenario 11: Verify Token for Deleted User

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Request a password reset and obtain the reset token | Token is generated |
| 2 | Delete the user from the database | User record is removed |
| 3 | Send `POST /v1/iam/forgot-password/verify` with the reset token | API returns `401 Unauthorized` with message "User not found" |

### Scenario 12: Verify Token with Missing Token Field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/verify` with `{}` (empty body) | API returns a Zod validation error |

### Scenario 13: Reset Password Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Request a password reset and obtain the reset token | Token is generated and stored |
| 2 | Send `POST /v1/iam/forgot-password/reset` with `{ "token": "{resetToken}", "password": "NewPass@123", "confirmPassword": "NewPass@123" }` | API returns `200 OK` with message "Password reset was successful" and `data: null` |
| 3 | Verify the user's password is updated in the database | Password is hashed and updated via `userV1Repository.updatePassword()` |
| 4 | Verify the reset token is hard-deleted from the database | Token record no longer exists in `user_tokens` |

### Scenario 14: Reset Password with Too Short Password

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/reset` with `{ "token": "{validToken}", "password": "Ab@1", "confirmPassword": "Ab@1" }` | API returns a Zod validation error with message `PasswordTooShort(8)` |

### Scenario 15: Reset Password with Weak Password

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/reset` with `{ "token": "{validToken}", "password": "simplepassword", "confirmPassword": "simplepassword" }` (missing uppercase, digit, special character) | API returns a Zod validation error with message `PasswordTooWeak` |

### Scenario 16: Reset Password with Mismatched Confirm Password

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/reset` with `{ "token": "{validToken}", "password": "NewPass@123", "confirmPassword": "DifferentPass@456" }` | API returns a Zod validation error with message `PasswordNotMatch` on path `confirmPassword` |

### Scenario 17: Reset Password with Missing Fields

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/reset` with `{ "password": "NewPass@123", "confirmPassword": "NewPass@123" }` (missing token) | API returns a Zod validation error |
| 2 | Send `POST /v1/iam/forgot-password/reset` with `{ "token": "{validToken}", "confirmPassword": "NewPass@123" }` (missing password) | API returns a Zod validation error |
| 3 | Send `POST /v1/iam/forgot-password/reset` with `{ "token": "{validToken}", "password": "NewPass@123" }` (missing confirmPassword) | API returns a Zod validation error |

### Scenario 18: Reset Password with Invalid or Expired Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/reset` with `{ "token": "invalid.token", "password": "NewPass@123", "confirmPassword": "NewPass@123" }` | API returns `401 Unauthorized` with message "Invalid or expired token" |

### Scenario 19: Reset Password with Already Used Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Request a password reset and obtain the reset token | Token is generated |
| 2 | Successfully reset the password using the token | Password is reset and token is hard-deleted |
| 3 | Attempt to reset again with the same token | API returns `401 Unauthorized` because the token record no longer exists |

### Scenario 20: All Forgot Password Endpoints Are Public

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/forgot-password/request` without an `Authorization` header | Request is accepted (no `401 Unauthorized` for missing token) |
| 2 | Send `POST /v1/iam/forgot-password/verify` without an `Authorization` header | Request is accepted |
| 3 | Send `POST /v1/iam/forgot-password/reset` without an `Authorization` header | Request is accepted |

### Scenario 21: All Forgot Password Endpoints Return HTTP 200

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Successfully call each forgot password POST endpoint | All return HTTP `200 OK` (not `201 Created`) due to `@HttpCode(HttpStatus.OK)` decorator |
