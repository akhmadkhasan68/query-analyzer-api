export interface IGitlabProject {
    id: number;
    name: string;
    name_with_namespace: string;
    path: string;
    path_with_namespace: string;
    description: string | null;
    web_url: string;
    default_branch: string;
    created_at: string;
    last_activity_at: string;
}

export class GitlabProjectV1Response {
    id: number;
    name: string;
    nameWithNamespace: string;
    path: string;
    pathWithNamespace: string;
    description: string | null;
    webUrl: string;
    defaultBranch: string;
    createdAt: string;
    lastActivityAt: string;

    static FromEntity(data: IGitlabProject): GitlabProjectV1Response {
        return {
            id: data.id,
            name: data.name,
            nameWithNamespace: data.name_with_namespace,
            path: data.path,
            pathWithNamespace: data.path_with_namespace,
            description: data.description,
            webUrl: data.web_url,
            defaultBranch: data.default_branch,
            createdAt: data.created_at,
            lastActivityAt: data.last_activity_at,
        };
    }

    static MapEntities(
        entities: IGitlabProject[],
    ): GitlabProjectV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
