export interface IOauth2UserInfo {
    email: string;
    fullname: string;
    picture?: string;
    emailVerified?: boolean;
}

export interface IOauth2Result {
    userInfo: IOauth2UserInfo;
    provider: string;
}
