import { Module } from '@nestjs/common';
import { config } from 'src/config';
import { HttpIntegrationModule } from 'src/infrastructures/integrations/http/http-integration.module';
import { Oauth2Auth0SSOService } from './services/oauth2-auth0-sso.service';
import { Oauth2FactoryService } from './services/oauth2-factory.service';
import { OAuth2GoogleSSOService } from './services/oauth2-google-sso.service';

@Module({
    imports: [
        HttpIntegrationModule.register(
            {
                baseURL: config.sso.oauth2.auth0.baseUrl,
                timeout: 10000,
                maxRedirects: 5,
            },
            'OAuth2Auth0HttpIntegration',
        ),
        HttpIntegrationModule.register(
            {
                baseURL: config.sso.oauth2.google.tokenBaseUrl,
                timeout: 10000,
                maxRedirects: 5,
            },
            'OAuth2GoogleTokenHttpIntegration',
        ),
        HttpIntegrationModule.register(
            {
                baseURL: config.sso.oauth2.google.userInfoBaseUrl,
                timeout: 10000,
                maxRedirects: 5,
            },
            'OAuth2GoogleUserInfoHttpIntegration',
        ),
    ],
    providers: [
        Oauth2Auth0SSOService,
        OAuth2GoogleSSOService,
        Oauth2FactoryService,
    ],
    exports: [Oauth2FactoryService],
})
export class OAuth2Module {}
