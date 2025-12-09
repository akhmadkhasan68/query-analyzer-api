export const OPERATION = {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    EXPORT: 'export',
    IMPORT: 'import',
} as const;

export type TOperation = (typeof OPERATION)[keyof typeof OPERATION];

export const RESOURCE = {
    USER: 'user',
    ROLE: 'role',
    PERMISSION: 'permission',
    LOG_ACTIVITY: 'log-activity',
    PROJECT: 'project',
    PROJECT_KEY: 'project-key',
    PROJECT_SLACK_CHANNEL: 'project-slack-channel',
    PROJECT_SETTING: 'project-setting',
};

export type TResource = (typeof RESOURCE)[keyof typeof RESOURCE];

export const PERMISSION_RESOURCE_OPERATION: Record<TResource, TOperation[]> = {
    [RESOURCE.USER]: [
        OPERATION.VIEW,
        OPERATION.CREATE,
        OPERATION.UPDATE,
        OPERATION.DELETE,
        OPERATION.EXPORT,
        OPERATION.IMPORT,
    ],

    [RESOURCE.ROLE]: [
        OPERATION.VIEW,
        OPERATION.CREATE,
        OPERATION.UPDATE,
        OPERATION.DELETE,
    ],

    [RESOURCE.PERMISSION]: [
        OPERATION.VIEW,
        OPERATION.CREATE,
        OPERATION.UPDATE,
        OPERATION.DELETE,
    ],

    [RESOURCE.LOG_ACTIVITY]: [OPERATION.VIEW, OPERATION.IMPORT],

    [RESOURCE.PROJECT]: [
        OPERATION.VIEW,
        OPERATION.CREATE,
        OPERATION.UPDATE,
        OPERATION.DELETE,
    ],

    [RESOURCE.PROJECT_KEY]: [
        OPERATION.VIEW,
        OPERATION.CREATE,
        OPERATION.DELETE,
    ],

    [RESOURCE.PROJECT_SLACK_CHANNEL]: [
        OPERATION.VIEW,
        OPERATION.CREATE,
        OPERATION.DELETE,
    ],

    [RESOURCE.PROJECT_SETTING]: [
        OPERATION.VIEW,
        OPERATION.CREATE,
        OPERATION.DELETE,
    ],
} as const;
