import { IBaseEntity } from './base-entity.interface';
import { IUser } from './user.interface';

export interface IRefreshToken extends IBaseEntity {
    user?: IUser;
    token: string;
    expiresAt: Date;
}
