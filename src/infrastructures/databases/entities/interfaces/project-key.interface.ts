import { IBaseEntity } from './base-entity.interface';
import { IProject } from './project.interface';

export interface IProjectKey extends IBaseEntity {
    name: string;
    hashedKey: string;
    maskedKey: string;
    lastUsedAt: Date;

    project?: IProject;
}
