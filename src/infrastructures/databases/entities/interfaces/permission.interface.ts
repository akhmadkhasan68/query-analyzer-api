import { IBaseEntity } from './base-entity.interface';
import { IOperation } from './operation.interface';
import { IResource } from './resource.interface';
import { IRole } from './role.interface';

export interface IPermission extends IBaseEntity {
    slug: string;
    name: string;
    description?: string;
    resource?: IResource;
    operation?: IOperation;
    roles?: IRole[];
}
