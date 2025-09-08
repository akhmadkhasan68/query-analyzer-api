import { IBaseEntity } from './base-entity.interface';
import { IPermission } from './permission.interface';
import { IUser } from './user.interface';

export interface IRole extends IBaseEntity {
    slug: string;
    name: string;
    description?: string;
    permissions?: IPermission[];
    users?: IUser[];
}
