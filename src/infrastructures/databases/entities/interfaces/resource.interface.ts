import { IBaseEntity } from './base-entity.interface';

export interface IResource extends IBaseEntity {
    slug: string;
    name: string;
    description?: string;
}
