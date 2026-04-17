# Test Scenarios: Authentication Login

## Preconditions

- The login endpoint is available at `POST /v1/iam/auth/login`
- A user exists in the database with a known email, phone number, and bcrypt-hashed password
- The user has roles with nested permissions (each containing `resource` and `operation`)
- The endpoint is public (`@Public()` decorator) and does not require JWT

## Scenarios

### Scenario 1: Valid Login with Email

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/login` with `email: "user@example.com"` and `password: "correctPassword"` | Valid credentials provided |
| 2 | Verify the response status | Response is HTTP 200 with `message: "Authentication successful"` |
| 3 | Verify the `user` object in response | Includes `id`, `fullname`, `email`, `phoneNumber`, and `roles` with nested `permissions` (each containing `resource` and `operation`) |
| 4 | Verify the `token` object in response | Includes `accessToken` (JWT string), `accessTokenExpiresIn` (ISO 8601 datetime), `refreshToken` (JWT string), and `refreshTokenExpiresIn` (ISO 8601 datetime) |

### Scenario 2: Valid Login with Phone Number

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/login` with `email: "+6281234567890"` (phone number in email field) and `password: "correctPassword"` | Phone number used for lookup |
| 2 | Verify the response | Response is HTTP 200 with `message: "Authentication successful"` (lookup uses `findOneByEmailOrPhoneNumber`) |

### Scenario 3: Wrong Password

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/login` with `email: "user@example.com"` and `password: "wrongPassword"` | Incorrect password |
| 2 | Observe the response | Response is HTTP 401 Unauthorized with message "Invalid credentials" |

### Scenario 4: Non-Existent User (Email)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/login` with `email: "nonexistent@example.com"` and `password: "anyPassword"` | Email not found |
| 2 | Observe the response | Response is HTTP 401 Unauthorized with message "Invalid credentials" |

### Scenario 5: Non-Existent User (Phone Number)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/login` with `email: "+0000000000000"` (non-existent phone) and `password: "anyPassword"` | Phone number not found |
| 2 | Observe the response | Response is HTTP 401 Unauthorized with message "Invalid credentials" |

### Scenario 6: No Information Leakage - Same Error Message

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send login with non-existent email and note the error message | Message is "Invalid credentials" |
| 2 | Send login with valid email but wrong password and note the error message | Message is "Invalid credentials" |
| 3 | Compare both error messages | Both return the same "Invalid credentials" message (no information about whether the account exists) |

### Scenario 7: Token Structure Verification

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Perform a successful login | Token is returned |
| 2 | Decode the JWT `accessToken` payload | Payload contains `id`, `fullname`, and `email` claims |
| 3 | Verify the refresh token is persisted in the database | A record exists in `user_tokens` with type `RefreshToken`, a UUID-based ID, and expiration based on `config.jwt.refreshTokenExpiresInSeconds` |

### Scenario 8: Missing Email Field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/login` with only `password` (omit `email`) | Email field missing |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 9: Missing Password Field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/login` with only `email` (omit `password`) | Password field missing |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 10: Both Fields Missing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/login` with an empty body `{}` | Both fields missing |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 11: Public Endpoint - No JWT Required

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/login` without any JWT or authorization header, with valid credentials | No token provided |
| 2 | Observe the response | Request is accepted and processed normally (HTTP 200); no 401 from global guard |

### Scenario 12: Password Comparison Uses Bcrypt

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Perform a successful login | Authentication succeeds |
| 2 | Verify the password comparison method | `HashUtil.compareHashBcrypt` is used for secure password comparison against the stored bcrypt hash |

### Scenario 13: Refresh Token Persistence

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Perform a successful login | Login succeeds |
| 2 | Query the `user_tokens` table for the authenticated user | Token record exists |
| 3 | Verify the record | Contains the refresh token JWT, a UUID-based record ID, type `RefreshToken`, and a valid expiration timestamp |
