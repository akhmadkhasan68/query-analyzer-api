/* eslint-disable no-console */
import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { PermissionUtil } from '../../../shared/utils/permission.util';
import { StringUtil } from '../../../shared/utils/string.util';
import { IPermission } from '../entities/interfaces/permission.interface';
import { Operation } from '../entities/operation.entity';
import { Permission } from '../entities/permission.entity';
import { Resource } from '../entities/resource.entity';

export default class PermissionSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const permissionRepository = dataSource.getRepository(Permission);
        const operationRepository = dataSource.getRepository(Operation);
        const resourceRepository = dataSource.getRepository(Resource);

        const permissionSlugs = PermissionUtil.getPermissionSlugs();
        const existingPermissions = await permissionRepository.find({
            where: {
                slug: In(permissionSlugs),
            },
        });
        const newPermissionSlugs = permissionSlugs.filter(
            (permission) =>
                !existingPermissions.some(
                    (existingPermission) =>
                        existingPermission.slug === permission,
                ),
        );

        // Operation
        const operations = PermissionUtil.getOperations();
        const existingOperations = await operationRepository.find();
        if (existingOperations.length === 0) {
            console.log('No operations found.');
            return;
        }

        const notFoundOperations = operations.filter(
            (group) =>
                !existingOperations.some(
                    (existingGroup) => existingGroup.slug === group,
                ),
        );
        if (notFoundOperations.length > 0) {
            console.log(
                `Operations not found: ${notFoundOperations.join(', ')}`,
            );
            return;
        }

        // Resources
        const resources = PermissionUtil.getResources();
        const existingResources = await resourceRepository.find();
        if (existingResources.length === 0) {
            console.log('No resources found.');
            return;
        }

        const notFoundResources = resources.filter(
            (group) =>
                !existingResources.some(
                    (existingGroup) => existingGroup.slug === group,
                ),
        );
        if (notFoundResources.length > 0) {
            console.log(`Resources not found: ${notFoundResources.join(', ')}`);
            return;
        }

        const permissionsToCreate: IPermission[] = [];
        newPermissionSlugs.forEach((newPermissionSlug) => {
            const [resourceSlugPart, operationSlugPart] =
                newPermissionSlug.split('.');
            const resourceSlug =
                PermissionUtil.getResourceBySlug(resourceSlugPart);
            const operationSlug =
                PermissionUtil.getOperationBySlug(operationSlugPart);

            const resource = existingResources.find(
                (resource) => resource.slug === resourceSlug,
            );
            const operation = existingOperations.find(
                (operation) => operation.slug === operationSlug,
            );

            if (resource && operation) {
                const permissionName =
                    StringUtil.slugToTitleCase(newPermissionSlug);
                const permissionDescription = StringUtil.slugToTitleCase(
                    `${newPermissionSlug.split('.').slice(1).join(' ')} Permission of ${resource.name}`,
                );
                const permissionSlug = newPermissionSlug;
                const existingPermission = existingPermissions.find(
                    (existingPermission) =>
                        existingPermission.slug === newPermissionSlug,
                );
                if (!existingPermission) {
                    const permissionToCreate = permissionRepository.create({
                        slug: permissionSlug,
                        name: permissionName,
                        description: permissionDescription,
                        resource: resource,
                        operation: operation,
                    });
                    permissionsToCreate.push(permissionToCreate);
                }
            } else {
                console.log(
                    `Resource and operation not found for permission: ${newPermissionSlug}`,
                );
            }
        });

        if (permissionsToCreate.length > 0) {
            await permissionRepository.save(permissionsToCreate);
            console.log(
                `Permissions seeded successfully: ${permissionsToCreate
                    .map((permission) => permission.slug)
                    .join(', ')}`,
            );
        } else {
            console.log('No new permissions to create.');
        }
    }
}
