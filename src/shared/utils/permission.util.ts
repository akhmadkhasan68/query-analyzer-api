import { IPermission } from 'src/infrastructures/databases/entities/interfaces/permission.interface';
import {
    OPERATION,
    PERMISSION_RESOURCE_OPERATION,
    RESOURCE,
    TOperation,
    TResource,
} from '../constants/permission.constant';

export const PermissionUtil = {
    getPermissionSlugs: (resource?: TResource) => {
        if (!resource) {
            const resources = Object.keys(
                PERMISSION_RESOURCE_OPERATION,
            ) as TResource[];

            return resources
                .map((resource) => {
                    return PERMISSION_RESOURCE_OPERATION[resource].map(
                        (operation) => {
                            return `${resource}.${operation}`;
                        },
                    );
                })
                .flat();
        }

        return PERMISSION_RESOURCE_OPERATION[resource].map((operation) => {
            return `${resource}.${operation}`;
        });
    },

    getPermissionSlugsByEntities: (permissions: IPermission[]) => {
        const slugs = permissions.map((permission) => permission.slug);
        return Array.from(new Set(slugs));
    },

    getResources: () => {
        return Object.keys(PERMISSION_RESOURCE_OPERATION) as TResource[];
    },

    getOperations: (): TOperation[] => {
        return Object.values(OPERATION) as TOperation[];
    },

    getResourceBySlug: (slug: string): TResource | null => {
        const resourceValue = Object.values(RESOURCE).find((resource) =>
            resource.startsWith(slug),
        );

        if (!resourceValue) {
            return null;
        }

        return resourceValue as TResource;
    },

    getOperationBySlug: (slug: string): TOperation | null => {
        const operationValue = Object.values(OPERATION).find((operation) =>
            operation.startsWith(slug),
        );

        if (!operationValue) {
            return null;
        }

        return operationValue as TOperation;
    },

    getPermissionSlugByResourceAndOperation: (
        resource: TResource,
        operation: TOperation,
    ) => {
        return `${resource}.${operation}`;
    },
};
