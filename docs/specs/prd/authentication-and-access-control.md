# Authentication and Access Control -- PRD

## Problem

The QueryAnalyzer platform is a multi-user system that requires secure authentication for human operators and fine-grained authorization to control access to resources such as users, roles, projects, and project configurations. The system must support both traditional credential-based login and enterprise SSO workflows, while enforcing permission checks at the resource-operation level.

## Solution

Implement a JWT-based authentication system with separate access tokens and refresh tokens. Support OAuth2/SSO login via a configurable provider factory (Auth0, Google). Enforce Role-Based Access Control (RBAC) where each Permission is defined as a combination of a Resource (e.g., `user`, `project`, `role`) and an Operation (e.g., `view`, `create`, `update`, `delete`, `export`, `import`). Users are assigned Roles, and Roles contain Permissions. A global `JwtAuthGuard` protects all endpoints by default, with `@Public()` and `@ExcludeGlobalGuard()` decorators to opt out specific routes. A `PermissionGuard` checks that the authenticated user's role permissions include the required resource-operation combination for each endpoint.

## Functional Requirements

- FR-AUTH-01: The system shall support email/password login via `POST /v1/iam/auth/login`, accepting `email` and `password` fields. The system shall look up users by email or phone number and validate the password using bcrypt comparison.
- FR-AUTH-02: Upon successful login, the system shall return an `accessToken` (JWT signed with configurable secret and expiry), a `refreshToken` (JWT signed with a separate secret and expiry), the access token expiration timestamp, and the refresh token expiration timestamp.
- FR-AUTH-03: The access token payload shall contain the user's `id`, `fullname`, and `email`. The refresh token payload shall contain a randomly generated UUID.
- FR-AUTH-04: The refresh token shall be persisted in the database as a `UserToken` entity with type `RefreshToken`, associated with the user, and including an `expiresAt` timestamp.
- FR-AUTH-05: The system shall support token refresh via `POST /v1/iam/auth/refresh-token`, protected by `JwtRefreshAuthGuard`. If the refresh token is expired, the system shall return an `UnauthorizedException`. On success, a new access token shall be generated while the same refresh token is reused.
- FR-AUTH-06: The system shall support retrieving the current authenticated user's profile via `GET /v1/iam/auth/me`, returning user details in `UserV1Response` format.
- FR-AUTH-07: The system shall support logout via `DELETE /v1/iam/auth/logout`, which soft-deletes all refresh tokens associated with the authenticated user.
- FR-AUTH-08: The system shall support OAuth2/SSO login. `GET /v1/iam/auth/oauth2/url` shall return the OAuth2 authorization URL from the configured provider (via `Oauth2FactoryService`). `POST /v1/iam/auth/oauth2` shall accept an authorization `code`, exchange it with the OAuth2 provider for user info, and authenticate against existing users. If the user does not exist in the database, authentication shall be rejected with `UnauthorizedException`.
- FR-AUTH-09: The system shall support a forgot-password flow with three endpoints: (a) `POST /v1/iam/forgot-password/request` accepts `email` and optional `redirectUrl`, generates a JWT reset token signed with a dedicated forgot-password secret, persists it as a `ForgotPasswordToken` user token, and sends a password reset email via BullMQ mail queue with the reset link. (b) `POST /v1/iam/forgot-password/verify` accepts a `token`, verifies its JWT signature, checks database existence and expiration, and returns success. (c) `POST /v1/iam/forgot-password/reset` accepts a `token` and `password`, verifies the token, updates the user's password, and deletes the used token.
- FR-AUTH-10: The system shall provide full User CRUD: paginated listing (`GET /v1/users`), creation (`POST /v1/users`), detail retrieval (`GET /v1/users/:userId`), update (`PATCH /v1/users/:userId`), password update (`PATCH /v1/users/:userId/password`), and soft delete (`DELETE /v1/users/:userId`). Each endpoint shall be protected by the `@Permission` decorator with the `user` resource and appropriate operation.
- FR-AUTH-11: The system shall support user import from Excel files (`POST /v1/users/import/excel`) accepting `.xlsx` and `.xls` files, multi-sheet Excel import (`POST /v1/users/import/excel-multi-sheet`), and CSV import (`POST /v1/users/import/csv`) with configurable delimiter (default `;`). Import template downloads shall be available for both Excel and CSV formats.
- FR-AUTH-12: The system shall support user export in multiple formats: Excel (`GET /v1/users/export/excel`), multi-sheet Excel (`GET /v1/users/export/excel-multi-sheet`), CSV with configurable delimiter (`GET /v1/users/export/csv`), and PDF (`GET /v1/users/export/pdf`). All export endpoints shall require the `export` permission on the `user` resource.
- FR-AUTH-13: The system shall provide full Role CRUD: paginated listing (`GET /v1/roles`), detail retrieval (`GET /v1/roles/:roleId`), creation (`POST /v1/roles`), update (`PATCH /v1/roles/:roleId`), and soft delete (`DELETE /v1/roles/:roleId`). Each endpoint shall be protected with the `role` resource and appropriate operation permission.
- FR-AUTH-14: The system shall support viewing permissions assigned to a role via `GET /v1/roles/:roleId/permissions` with pagination.
- FR-AUTH-15: The system shall provide read-only Permission endpoints: paginated listing (`GET /v1/permissions`) and detail retrieval (`GET /v1/permissions/:permissionId`). Both shall require `view` permission on the `permission` resource.
- FR-AUTH-16: The RBAC model shall define the following resources and their allowed operations: `user` (view, create, update, delete, export, import), `role` (view, create, update, delete), `permission` (view, create, update, delete), `log-activity` (view, import), `project` (view, create, update, delete), `project-key` (view, create, delete), `project-slack-channel` (view, create, delete), `project-setting` (view, create, delete).
- FR-AUTH-17: The `PermissionGuard` shall extract permissions from the user's roles (via `user.roles.flatMap(role => role.permissions)`), compute permission slugs, and verify that all required operations for the requested resource are present. If permissions are insufficient, a `ForbiddenException` shall be thrown.
- FR-AUTH-18: The `@Public()` decorator shall bypass both authentication and authorization. The `@ExcludeGlobalGuard()` decorator shall bypass the global JWT guard while still allowing endpoint-specific guards (e.g., `ProjectApiKeyGuard`).

## Out of Scope

- Multi-factor authentication (MFA/2FA)
- User self-registration (users must be created by administrators or imported)
- OAuth2 auto-provisioning of new users (only existing users can log in via SSO)
- Session management beyond JWT token lifecycle
- Account lockout after failed login attempts
- Password complexity validation rules at the API level (to be enforced by the client)
