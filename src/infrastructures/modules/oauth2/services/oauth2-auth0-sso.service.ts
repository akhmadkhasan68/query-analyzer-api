import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { config } from 'src/config';
import { HttpIntegrationV1Service } from 'src/infrastructures/integrations/http/http-integration-v1.service';
import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { Oauth2Provider } from '../constants/oauth2-provider.constant';
import {
    IOauth2Result,
    IOauth2UserInfo,
} from '../interfaces/oauth2-auth-result.interface';
import { IOauth2Provider } from '../interfaces/oauth2-provider.interface';

interface IAuth0TokenResponse {
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
}

interface IAuth0UserInfo {
    email: string;
    name: string;
    picture?: string;
    email_verified?: boolean;
    sub: string;
}

interface IAuth0RequestToken {
    grant_type: string;
    code: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    scope?: string;
}

@Injectable()
export class Oauth2Auth0SSOService implements IOauth2Provider {
    private readonly logger = new Logger(Oauth2Auth0SSOService.name);
    private readonly auth0Config = config.sso.oauth2.auth0;
    private readonly grantType = 'authorization_code';
    private readonly scope = 'openid profile email';

    constructor(
        @Inject('OAuth2Auth0HttpIntegration')
        private readonly httpIntegrationService: HttpIntegrationV1Service,
    ) {}

    /**
     * Authenticate user with Auth0 authorization code
     * Backend exchanges authorization code for access token, then fetches user info
     */
    async authenticate(authorizationCode: string): Promise<IOauth2Result> {
        try {
            // Step 1: Exchange authorization code for access token
            const tokenResponse = await this.httpIntegrationService.post<
                IAuth0RequestToken,
                IAuth0TokenResponse
            >(
                '/oauth/token',
                {
                    grant_type: this.grantType,
                    code: authorizationCode,
                    client_id: this.auth0Config.clientId,
                    client_secret: this.auth0Config.clientSecret,
                    redirect_uri: this.auth0Config.callbackURL,
                    scope: this.scope,
                },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'application/json',
                },
            );

            const userInfo = await this.httpIntegrationService.get<
                undefined,
                IAuth0UserInfo
            >('/userinfo', undefined, {
                Authorization: `Bearer ${tokenResponse.access_token}`,
            });

            // Step 3: Map Auth0 user info to application format
            const ssoUserInfo: IOauth2UserInfo = {
                email: userInfo.email,
                fullname: userInfo.name,
                picture: userInfo.picture,
                emailVerified: userInfo.email_verified,
            };

            if (!ssoUserInfo.email) {
                throw new UnauthorizedException('Email not provided by Auth0');
            }

            return {
                userInfo: ssoUserInfo,
                provider: this.getProviderName(),
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException(
                ERROR_MESSAGE_CONSTANT.InvalidCredentials,
            );
        }
    }

    /**
     * Generate authorization URL for OAuth2 flow
     */
    async getAuthorizationUrl(state?: string): Promise<string> {
        try {
            const params = new URLSearchParams({
                client_id: this.auth0Config.clientId,
                response_type: 'code',
                redirect_uri: this.auth0Config.callbackURL,
                scope: 'openid profile email',
            });

            if (state) {
                params.append('state', state);
            }

            const authUrl = `${this.auth0Config.baseUrl}/authorize?${params.toString()}`;

            this.logger.log('Generated Auth0 authorization URL');
            return authUrl;
        } catch (error) {
            this.logger.error('Failed to generate authorization URL', error);
            throw new InternalServerErrorException(
                'Failed to generate authorization URL',
            );
        }
    }

    /**
     * Get provider name
     */
    getProviderName(): string {
        return Oauth2Provider.Auth0;
    }

    /**
     * Validate Auth0 configuration
     */
    validateProvider(): boolean {
        const isValid =
            !!this.auth0Config.domain &&
            !!this.auth0Config.clientId &&
            !!this.auth0Config.clientSecret &&
            !!this.auth0Config.callbackURL;

        if (!isValid) {
            this.logger.warn(
                'Auth0 configuration is incomplete. Check environment variables: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_CALLBACK_URL',
            );
        }

        return isValid;
    }
}
