import { UserTokenTypeEnum } from 'src/shared/enums/user-token.enum';
import { IBaseEntity } from './base-entity.interface';
import { IUser } from './user.interface';

export interface IUserToken extends IBaseEntity {
    user?: IUser;
    token: string;
    expiresAt: Date;
    type: UserTokenTypeEnum;
}
