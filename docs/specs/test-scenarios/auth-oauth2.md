# Test Scenarios: Authentication OAuth2 (SSO)

## Preconditions

- The OAuth2 endpoints are available at `GET /v1/iam/auth/oauth2/url` and `POST /v1/iam/auth/oauth2`
- The OAuth2 provider (auth0 or google) is properly configured in the environment
- A user exists in the system with an email matching the OAuth2 provider's user info
- Both endpoints are public (`@Public()` at class level) and do not require JWT

## Scenarios

### Scenario 1: Get OAuth2 Authorization URL - Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure the OAuth2 provider is properly configured (e.g., google or auth0) | Provider is configured |
| 2 | Send `GET /v1/iam/auth/oauth2/url` | Request for authorization URL |
| 3 | Verify the response | Response is HTTP 200 with `message: "OAuth2 authorization URL generated successfully."` and `data.url` containing the full authorization URL with `client_id`, `redirect_uri`, and `scope` parameters |

### Scenario 2: Get OAuth2 URL - Provider Not Configured

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Ensure the OAuth2 provider is not properly configured in the environment | Missing or invalid config |
| 2 | Send `GET /v1/iam/auth/oauth2/url` | Request for authorization URL |
| 3 | Observe the response | Response is HTTP 400 Bad Request indicating the provider is not configured correctly |

### Scenario 3: Get OAuth2 URL - Unsupported Provider (GitLab/Microsoft)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Configure the provider as `gitlab` or `microsoft` (not yet implemented) | Unsupported provider |
| 2 | Send `GET /v1/iam/auth/oauth2/url` | Request for authorization URL |
| 3 | Observe the response | Response is HTTP 400 Bad Request (these providers throw `BadRequestException`) |

### Scenario 4: Get OAuth2 URL - No Authentication Required

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/iam/auth/oauth2/url` without any authentication token | No JWT provided |
| 2 | Observe the response | Request is accepted normally (endpoint is public via `@Public()`) |

### Scenario 5: Valid Code Exchange - User Exists in System

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Obtain a valid authorization code from the OAuth2 provider | Code is available |
| 2 | Send `POST /v1/iam/auth/oauth2` with `code: "<valid_code>"` | Valid code exchange request |
| 3 | Verify the response | Response is HTTP 200 with `message: "Login via OAuth2 successful."` |
| 4 | Verify the `user` object | Includes `id`, `fullname`, `email`, `phoneNumber`, and `roles` with nested `permissions` |
| 5 | Verify the `token` object | Includes `accessToken`, `accessTokenExpiresIn`, `refreshToken`, and `refreshTokenExpiresIn` |
| 6 | Verify the database | A refresh token record is saved in `user_tokens` with type `RefreshToken` |

### Scenario 6: Code Exchange - User Email Not Registered in System

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Obtain a valid authorization code for an email not registered in the system | Code belongs to unregistered user |
| 2 | Send `POST /v1/iam/auth/oauth2` with the valid code | Code exchange request |
| 3 | Observe the response | Response is HTTP 401 Unauthorized with message "Invalid credentials" (OAuth2 does not auto-create users) |

### Scenario 7: Code Exchange - Invalid or Expired Code

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/oauth2` with `code: "invalid_or_expired_code"` | Invalid code |
| 2 | Observe the response | OAuth2 provider exchange fails and an appropriate error response is returned |

### Scenario 8: Code Exchange - Missing Code Field

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/iam/auth/oauth2` with an empty body `{}` (no `code` field) | Code field missing |
| 2 | Observe the response | Response is HTTP 400 Bad Request |

### Scenario 9: Provider Selection - Google

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set `config.sso.oauth2.provider` to `google` | Google provider configured |
| 2 | Send `GET /v1/iam/auth/oauth2/url` | Request authorization URL |
| 3 | Verify the URL | Google OAuth2 authorization URL is returned |
| 4 | Exchange a valid Google authorization code via `POST /v1/iam/auth/oauth2` | Code exchange with Google |
| 5 | Verify the response | Login succeeds using Google OAuth2 provider |

### Scenario 10: Provider Selection - Auth0

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set `config.sso.oauth2.provider` to `auth0` | Auth0 provider configured |
| 2 | Send `GET /v1/iam/auth/oauth2/url` | Request authorization URL |
| 3 | Verify the URL | Auth0 OAuth2 authorization URL is returned |
| 4 | Exchange a valid Auth0 authorization code via `POST /v1/iam/auth/oauth2` | Code exchange with Auth0 |
| 5 | Verify the response | Login succeeds using Auth0 OAuth2 provider |

### Scenario 11: Provider Determined Server-Side (Not by Request)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set `config.sso.oauth2.provider` to `google` | Server-side config |
| 2 | Send `GET /v1/iam/auth/oauth2/url` (no provider parameter in request) | No provider in request |
| 3 | Verify the response | Google authorization URL is returned (provider is determined by environment configuration, not request parameters) |

### Scenario 12: User Lookup Uses Email Only

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | OAuth2 provider returns user info including `email`, `fullname`, `picture`, and `emailVerified` | Full user info from provider |
| 2 | Verify the user lookup logic | Only `email` is used to find the existing user in the database |

### Scenario 13: Multiple OAuth2 Logins Create Multiple Refresh Tokens

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Perform a successful OAuth2 login for a user | First login; refresh token created |
| 2 | Perform another OAuth2 login for the same user | Second login |
| 3 | Verify the `user_tokens` table | A new refresh token record is created each time (multiple records exist for the same user) |

### Scenario 14: Public Controller - All OAuth2 Endpoints Accept Unauthenticated Requests

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/iam/auth/oauth2/url` without any JWT | No auth on GET |
| 2 | Observe the response | Request is processed without requiring a JWT token |
| 3 | Send `POST /v1/iam/auth/oauth2` without any JWT (with valid code) | No auth on POST |
| 4 | Observe the response | Request is processed without requiring a JWT token |
