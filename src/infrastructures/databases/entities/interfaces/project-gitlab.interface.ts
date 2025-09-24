import { IBaseEntity } from './base-entity.interface';
import { IProject } from './project.interface';

export interface IProjectGitlab extends IBaseEntity {
    projectId: string;
    gitlabProjectId: number;
    gitlabUrl: string;
    gitlabGroupId: number;
    gitlabGroupName: string;
    gitlabDefaultBranch: string;
    gitlabVisibility: string;

    project?: IProject;
}
