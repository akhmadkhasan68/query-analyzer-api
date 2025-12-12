import { Oauth2Provider } from '../constants/oauth2-provider.constant';

export type TSSOProviderType =
    (typeof Oauth2Provider)[keyof typeof Oauth2Provider];
