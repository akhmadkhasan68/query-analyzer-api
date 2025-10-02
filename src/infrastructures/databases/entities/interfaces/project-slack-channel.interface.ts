import { IBaseEntity } from './base-entity.interface';
import { IProject } from './project.interface';

export interface IProjectSlackChannel extends IBaseEntity {
    projectId: string;
    slackChannelId: string;

    project?: IProject;
}
