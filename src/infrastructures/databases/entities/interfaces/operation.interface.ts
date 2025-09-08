import { IBaseEntity } from './base-entity.interface';

export interface IOperation extends IBaseEntity {
    slug: string;
    name: string;
}
