export const GitlabRouteConstant = {
    version: '/version',
    projects: '/projects',
    repositoryFile: (projectId: number, filePath: string): string =>
        `/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}`,
} as const;
