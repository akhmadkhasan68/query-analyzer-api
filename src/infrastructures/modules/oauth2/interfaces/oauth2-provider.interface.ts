import { IOauth2Result } from './oauth2-auth-result.interface';

export interface IOauth2Provider {
    /**
     * Authenticate user with OAuth2 provider authorization code and return user info
     * Backend exchanges authorization code for access token with the provider
     * @param code - Authorization code from OAuth2 provider
     * @returns Promise with user info from OAuth2 provider
     */
    authenticate(code: string): Promise<IOauth2Result>;

    /**
     * Generate authorization URL for SSO provider
     * @param state - Optional state parameter for CSRF protection
     * @returns Promise with authorization URL string
     */
    getAuthorizationUrl(state?: string): Promise<string>;

    /**
     * Get the name of the SSO provider
     * @returns Provider name (e.g., 'auth0', 'google', 'microsoft', 'gitlab')
     */
    getProviderName(): string;

    /**
     * Validate if the provider is properly configured
     * @returns true if provider configuration is valid
     */
    validateProvider(): boolean;
}
