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
} as const;
