import { Oauth2Provider } from '../constants/oauth2-provider.constant';
import { IOauth2Provider } from './oauth2-provider.interface';

export interface IOAuth2ProviderMapServices {
    [Oauth2Provider.Auth0]: IOauth2Provider;
    [Oauth2Provider.Google]: IOauth2Provider;
    [Oauth2Provider.Gitlab]: IOauth2Provider;
    [Oauth2Provider.Microsoft]: IOauth2Provider;
}
