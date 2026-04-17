# AC: Authentication OAuth2 (SSO)

## Context

Public endpoints for OAuth2/SSO authentication. The flow consists of two steps: (1) `GET /v1/iam/auth/oauth2/url` to obtain the authorization URL for the configured provider, and (2) `POST /v1/iam/auth/oauth2` to exchange an authorization code for JWT tokens. Supported providers are `auth0` and `google`. The entire controller is public (`@Public()` at class level). OAuth2 login does not create new users -- users must already exist in the system.

## Acceptance Criteria

### Get OAuth2 Authorization URL (`GET /v1/iam/auth/oauth2/url`)

- [ ] Given a properly configured OAuth2 provider (auth0 or google), when a GET request is sent, then the response is HTTP 200 with `message: "OAuth2 authorization URL generated successfully."` and `data.url` containing the full authorization URL with client_id, redirect_uri, and scope parameters
- [ ] Given the OAuth2 provider is not properly configured in the environment, when a GET request is sent, then the response is HTTP 400 Bad Request indicating the provider is not configured correctly
- [ ] Given the configured provider is `gitlab` or `microsoft` (not yet implemented), when a GET request is sent, then the response is HTTP 400 Bad Request (these providers throw `BadRequestException`)
- [ ] Given no authentication token is provided, when a GET request is sent, then the request is accepted normally (endpoint is public via `@Public()`)

### OAuth2 Login / Code Exchange (`POST /v1/iam/auth/oauth2`)

- [ ] Given a valid authorization code and the corresponding user email exists in the system, when a POST request is sent, then the response is HTTP 200 with `message: "Login via OAuth2 successful."` and `data` containing `user` and `token` objects
- [ ] Given a successful OAuth2 login, when inspecting the `user` object, then it includes `id`, `fullname`, `email`, `phoneNumber`, and `roles` with nested `permissions`
- [ ] Given a successful OAuth2 login, when inspecting the `token` object, then it includes `accessToken`, `accessTokenExpiresIn`, `refreshToken`, and `refreshTokenExpiresIn`
- [ ] Given a successful OAuth2 login, when checking the database, then a refresh token record is saved in `user_tokens` with type `RefreshToken`

### Authorization Failures

- [ ] Given a valid authorization code but the user's email is not registered in the system, when a POST request is sent, then the response is HTTP 401 Unauthorized with message "Invalid credentials" (OAuth2 does not auto-create users)
- [ ] Given an invalid or expired authorization code, when a POST request is sent, then the OAuth2 provider exchange fails and an appropriate error response is returned
- [ ] Given the `code` field is missing from the request body, when a POST request is sent, then the response is HTTP 400 Bad Request

### Provider Selection

- [ ] Given the environment config `config.sso.oauth2.provider` is set to `google`, when the OAuth2 flow is initiated, then the Google OAuth2 provider is used for both URL generation and code exchange
- [ ] Given the environment config `config.sso.oauth2.provider` is set to `auth0`, when the OAuth2 flow is initiated, then the Auth0 OAuth2 provider is used
- [ ] Given the provider is determined by environment configuration, when a request is made, then the provider is not selected by request parameters (it is server-side configured)

### Edge Cases

- [ ] Given the entire OAuth2 controller uses `@Public()`, when any request is sent without authentication, then it is processed without requiring a JWT token
- [ ] Given the OAuth2 provider returns user info including `email`, `fullname`, `picture`, and `emailVerified`, when the user is looked up, then only `email` is used to find the existing user in the database
- [ ] Given the same user logs in via OAuth2 multiple times, when each login occurs, then a new refresh token record is created each time
