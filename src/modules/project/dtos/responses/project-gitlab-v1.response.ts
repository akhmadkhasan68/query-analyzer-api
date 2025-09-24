import { IProjectGitlab } from 'src/infrastructures/databases/entities/interfaces/project-gitlab.interface';
import { ProjectV1Response } from './project-v1.response';

export class ProjectGitlabV1Response {
    id: string;
    gitlabProjectId: number;
    gitlabUrl: string;
    gitlabGroupId: number;
    gitlabGroupName: string;
    gitlabDefaultBranch: string;
    gitlabVisibility: string;

    project?: ProjectV1Response;

    static FromEntity(entity: IProjectGitlab): ProjectGitlabV1Response {
        const response = new ProjectGitlabV1Response();

        response.id = entity.id;
        response.gitlabProjectId = entity.gitlabProjectId;
        response.gitlabUrl = entity.gitlabUrl;
        response.gitlabGroupId = entity.gitlabGroupId;
        response.gitlabGroupName = entity.gitlabGroupName;
        response.gitlabDefaultBranch = entity.gitlabDefaultBranch;
        response.gitlabVisibility = entity.gitlabVisibility;

        if (entity.project) {
            response.project = ProjectV1Response.FromEntity(entity.project);
        }

        return response;
    }

    static MapEntities(entities: IProjectGitlab[]): ProjectGitlabV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
