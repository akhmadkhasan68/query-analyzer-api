# Test Scenarios: Authentication Session Management

## Preconditions

- A registered user exists in the database with known credentials
- The user has been assigned one or more roles, each with associated permissions
- A valid access token and refresh token have been issued for the user
- The refresh token is stored in the `user_tokens` database table

## Scenarios

### Scenario 1: Get Current User with Valid Access Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate and obtain a valid access token | Access token is returned |
| 2 | Send `GET /v1/iam/auth/me` with `Authorization: Bearer {accessToken}` | API returns `200 OK` with `id`, `fullname`, `email`, `phoneNumber`, and `roles` (including nested `permissions` for each role) |

### Scenario 2: Get Current User with Multiple Roles

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create a user with multiple roles assigned | User is created with multiple roles |
| 2 | Authenticate and obtain a valid access token | Access token is returned |
| 3 | Send `GET /v1/iam/auth/me` with `Authorization: Bearer {accessToken}` | API returns `200 OK` with all assigned roles and their permissions included in the response |

### Scenario 3: Get Current User Without Authorization Header

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/iam/auth/me` without an `Authorization` header | API returns `401 Unauthorized` with message "Unauthorized" |

### Scenario 4: Get Current User with Expired Access Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Obtain an access token and wait for it to expire (or use a pre-expired token) | Token is expired |
| 2 | Send `GET /v1/iam/auth/me` with the expired access token | API returns `401 Unauthorized` with message "Unauthorized" |

### Scenario 5: Get Current User with Malformed JWT

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/iam/auth/me` with `Authorization: Bearer invalid.jwt.token` | API returns `401 Unauthorized` with message "Unauthorized" |

### Scenario 6: Get Current User for Soft-Deleted Account

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate and obtain a valid access token | Access token is returned |
| 2 | Soft-delete the user's account from the database | User record is soft-deleted |
| 3 | Send `GET /v1/iam/auth/me` with the previously obtained access token | API returns `401 Unauthorized` with message "Unauthorized" |

### Scenario 7: Get Current User Using Refresh Token Instead of Access Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Obtain a valid refresh token | Refresh token is returned |
| 2 | Send `GET /v1/iam/auth/me` with `Authorization: Bearer {refreshToken}` | API returns `401 Unauthorized` because the JWT strategy expects an access token payload |

### Scenario 8: Refresh Token Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate and obtain a valid refresh token | Refresh token is stored in `user_tokens` table |
| 2 | Send `POST /v1/iam/auth/refresh-token` with `Authorization: Bearer {refreshToken}` | API returns `200 OK` with a new `accessToken`, the original `refreshToken` (unchanged), user data, and expiration timestamps in ISO 8601 format |
| 3 | Verify `refreshTokenExpiresIn` matches the original expiration time | Refresh token is not rotated; expiration remains the same |

### Scenario 9: Refresh Token with Expired Refresh Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Use an expired refresh token | Token has passed its `expiresAt` date |
| 2 | Send `POST /v1/iam/auth/refresh-token` with the expired token | API returns `401 Unauthorized` with message "Refresh token expired" |

### Scenario 10: Refresh Token Not Found in Database

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Use a valid JWT-formatted refresh token that does not exist in the `user_tokens` table | Token is not stored in database |
| 2 | Send `POST /v1/iam/auth/refresh-token` with this token | API returns `401 Unauthorized` |

### Scenario 11: Refresh Token Without Authorization Header

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/refresh-token` without an `Authorization` header | API returns `401 Unauthorized` |

### Scenario 12: Refresh Token for Deleted User

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Obtain a valid refresh token for a user | Refresh token is stored |
| 2 | Delete the user from the database | User record is removed |
| 3 | Send `POST /v1/iam/auth/refresh-token` with the refresh token | API returns `401 Unauthorized` with message "User not found" |

### Scenario 13: Refresh Token After Logout (Soft-Deleted Token)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate and obtain a valid refresh token | Refresh token is active |
| 2 | Call `DELETE /v1/iam/auth/logout` to soft-delete all tokens | Logout is successful |
| 3 | Send `POST /v1/iam/auth/refresh-token` with the previously valid refresh token | API returns `401 Unauthorized` because the token is no longer found |

### Scenario 14: Logout Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate and obtain a valid access token | Access token is returned |
| 2 | Send `DELETE /v1/iam/auth/logout` with `Authorization: Bearer {accessToken}` | API returns `200 OK` with `data: null` and message "Logout successful" |
| 3 | Verify refresh tokens in `user_tokens` table | All user's refresh tokens are soft-deleted (not hard-deleted) |

### Scenario 15: Logout with No Active Refresh Tokens

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure the user has no active refresh tokens in the database | No tokens exist |
| 2 | Send `DELETE /v1/iam/auth/logout` with a valid access token | API returns `200 OK` with `data: null` and message "Logout successful" (no error thrown) |

### Scenario 16: Logout Without Valid Access Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `DELETE /v1/iam/auth/logout` without a valid access token | API returns `401 Unauthorized` |

### Scenario 17: Refresh Token Uses Correct Guard

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/refresh-token` with a valid refresh token | Request is processed by `JwtRefreshAuthGuard` (not the global JWT access token guard) |
| 2 | Verify the endpoint uses `@ExcludeGlobalGuard()` and `@UseGuards(JwtRefreshAuthGuard)` | Correct guard chain is applied |

### Scenario 18: Refresh Token Double Expiry Validation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Use a refresh token that is valid in JWT but expired in the database (`expiresAt < now`) | Token has conflicting validity states |
| 2 | Send `POST /v1/iam/auth/refresh-token` with this token | API returns `401 Unauthorized` because expiry is validated both in `JwtRefreshStrategy.validate()` and in `IamAuthV1Service.refreshToken()` |
