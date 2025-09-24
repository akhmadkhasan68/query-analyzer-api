import { ProjectStatusEnum } from '../../../../modules/project/shared/enums/project-status.enum';
import { IBaseEntity } from './base-entity.interface';
import { IPlatform } from './platform.interface';
import { IProjectGitlab } from './project-gitlab.interface';
import { IProjectKey } from './project-key.interface';

export interface IProject extends IBaseEntity {
    name: string;
    description?: string;
    status: ProjectStatusEnum;
    platform?: IPlatform;

    projectKeys?: IProjectKey[];
    projectGitlab?: IProjectGitlab;
}
