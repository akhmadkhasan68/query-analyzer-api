import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { config } from 'src/config';
import { Oauth2Provider } from '../constants/oauth2-provider.constant';
import { IOAuth2ProviderMapServices } from '../interfaces/oauth2-provider-map.interface';
import { IOauth2Provider } from '../interfaces/oauth2-provider.interface';
import { TSSOProviderType } from '../types/sso-provider.type';
import { Oauth2Auth0SSOService } from './oauth2-auth0-sso.service';
import { OAuth2GoogleSSOService } from './oauth2-google-sso.service';

@Injectable()
export class Oauth2FactoryService {
    private readonly logger = new Logger(Oauth2FactoryService.name);

    constructor(
        private readonly auth0SSOService: Oauth2Auth0SSOService,
        private readonly googleSSOService: OAuth2GoogleSSOService,
    ) {}

    /**
     * Get SSO provider instance by type
     * @param providerType - Optional provider type, defaults to configured provider
     * @returns SSO provider instance
     */
    getProvider<T extends TSSOProviderType>(
        providerType?: T,
    ): IOAuth2ProviderMapServices[T] {
        const type =
            providerType || (config.sso.oauth2.provider as TSSOProviderType);

        this.logger.log(`Getting SSO provider: ${type}`);

        let provider: IOauth2Provider;

        switch (type) {
            case Oauth2Provider.Auth0:
                provider = this.auth0SSOService;
                break;
            case Oauth2Provider.Google:
                provider = this.googleSSOService;
                break;
            case Oauth2Provider.Gitlab:
                throw new BadRequestException(
                    'SSO provider Gitlab is not yet implemented.',
                );
            case Oauth2Provider.Microsoft:
                throw new BadRequestException(
                    'SSO provider Microsoft is not yet implemented.',
                );
            default:
                throw new BadRequestException(
                    `Unsupported SSO provider: ${type}. Supported providers: ${Object.values(Oauth2Provider).join(', ')}`,
                );
        }

        // Validate provider configuration
        if (!provider.validateProvider()) {
            throw new BadRequestException(
                `SSO provider '${type}' is not properly configured. Please check your environment variables.`,
            );
        }

        return provider as IOAuth2ProviderMapServices[T];
    }

    /**
     * Get list of available SSO providers
     * @returns Array of available provider types
     */
    getAvailableProviders(): TSSOProviderType[] {
        return [Oauth2Provider.Auth0, Oauth2Provider.Google];
        // TODO: Add other providers as they are implemented
        // return [SSO_PROVIDER.AUTH0, SSO_PROVIDER.GOOGLE, SSO_PROVIDER.MICROSOFT, SSO_PROVIDER.GITLAB];
    }

    /**
     * Get current configured SSO provider from environment
     * @returns Current provider type
     */
    getCurrentProvider(): TSSOProviderType {
        return config.sso.oauth2.provider as TSSOProviderType;
    }

    /**
     * Check if a specific provider is available
     * @param providerType - Provider type to check
     * @returns true if provider is implemented and configured
     */
    isProviderAvailable(providerType: TSSOProviderType): boolean {
        try {
            const provider = this.getProvider(providerType);
            return provider.validateProvider();
        } catch (error) {
            return false;
        }
    }
}
