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

interface IGoogleTokenResponse {
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface IGoogleUserInfo {
    email: string;
    name: string;
    picture?: string;
    email_verified?: boolean;
    sub: string;
}

interface IGoogleRequestToken {
    grant_type: string;
    code: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
}

@Injectable()
export class OAuth2GoogleSSOService implements IOauth2Provider {
    private readonly logger = new Logger(OAuth2GoogleSSOService.name);
    private readonly googleConfig = config.sso.oauth2.google;
    private readonly grantType = 'authorization_code';
    private readonly scope = 'openid profile email';

    constructor(
        @Inject('OAuth2GoogleTokenHttpIntegration')
        private readonly tokenHttpIntegrationService: HttpIntegrationV1Service,
        @Inject('OAuth2GoogleUserInfoHttpIntegration')
        private readonly userInfoHttpIntegrationService: HttpIntegrationV1Service,
    ) {}

    /**
     * Authenticate user with Google authorization code
     * Backend exchanges authorization code for access token, then fetches user info
     */
    async authenticate(authorizationCode: string): Promise<IOauth2Result> {
        try {
            // Step 1: Exchange authorization code for access token
            const tokenResponse = await this.tokenHttpIntegrationService.post<
                IGoogleRequestToken,
                IGoogleTokenResponse
            >(
                '/token',
                {
                    grant_type: this.grantType,
                    code: authorizationCode,
                    client_id: this.googleConfig.clientId,
                    client_secret: this.googleConfig.clientSecret,
                    redirect_uri: this.googleConfig.callbackURL,
                },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            );

            // Step 2: Fetch user info using access token
            const userInfo = await this.userInfoHttpIntegrationService.get<
                undefined,
                IGoogleUserInfo
            >('/oauth2/v2/userinfo', undefined, {
                Authorization: `Bearer ${tokenResponse.access_token}`,
            });

            // Step 3: Map Google user info to application format
            const ssoUserInfo: IOauth2UserInfo = {
                email: userInfo.email,
                fullname: userInfo.name,
                picture: userInfo.picture,
                emailVerified: userInfo.email_verified,
            };

            if (!ssoUserInfo.email) {
                throw new UnauthorizedException('Email not provided by Google');
            }

            return {
                userInfo: ssoUserInfo,
                provider: this.getProviderName(),
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            this.logger.error('Google OAuth2 authentication failed', error);
            throw new UnauthorizedException(
                ERROR_MESSAGE_CONSTANT.InvalidCredentials,
            );
        }
    }

    /**
     * Generate authorization URL for Google OAuth2 flow
     */
    async getAuthorizationUrl(state?: string): Promise<string> {
        try {
            const params = new URLSearchParams({
                client_id: this.googleConfig.clientId,
                response_type: 'code',
                redirect_uri: this.googleConfig.callbackURL,
                scope: this.scope,
                access_type: 'offline',
                prompt: 'consent',
            });

            if (state) {
                params.append('state', state);
            }

            const authUrl = `${this.googleConfig.authUrl}?${params.toString()}`;

            this.logger.log('Generated Google authorization URL');
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
        return Oauth2Provider.Google;
    }

    /**
     * Validate Google OAuth2 configuration
     */
    validateProvider(): boolean {
        const isValid =
            !!this.googleConfig.clientId &&
            !!this.googleConfig.clientSecret &&
            !!this.googleConfig.callbackURL;

        if (!isValid) {
            this.logger.warn(
                'Google OAuth2 configuration is incomplete. Check environment variables: SSO_OAUTH2_CLIENT_ID, SSO_OAUTH2_CLIENT_SECRET, SSO_OAUTH2_CALLBACK_URL',
            );
        }

        return isValid;
    }
}
