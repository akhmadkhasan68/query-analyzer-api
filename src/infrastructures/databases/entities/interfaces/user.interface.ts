import { IBaseEntity } from './base-entity.interface';
import { IRole } from './role.interface';
import { IUserToken } from './user-token.interface';

export interface IUser extends IBaseEntity {
    fullname: string;
    email: string;
    emailVerifiedAt?: Date;
    password: string;
    phoneNumber: string;
    phoneNumberVerifiedAt?: Date;
    roles?: IRole[];
    userTokens?: IUserToken[];
}
