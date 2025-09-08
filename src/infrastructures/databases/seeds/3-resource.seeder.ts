/* eslint-disable no-console */
import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { RESOURCE } from '../../../shared/constants/permission.constant';
import { StringUtil } from '../../../shared/utils/string.util';
import { IResource } from '../entities/interfaces/resource.interface';
import { Resource } from '../entities/resource.entity';

export default class ResourceSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const resourceRepository = dataSource.getRepository(Resource);

        const resourceSlugs = Object.values(RESOURCE);
        // Existing Resources
        const existingResources = await resourceRepository.find({
            where: {
                slug: In(resourceSlugs),
            },
        });

        // Create Resources
        const resourcesToCreate: Partial<IResource>[] = [];
        for (const resourceKey of resourceSlugs) {
            const resourceName = StringUtil.slugToTitleCase(resourceKey);
            const resourceDescription = `${resourceName} resource`;
            const resourceSlug = resourceKey;

            const existingResource = existingResources.find(
                (group) => group.slug === resourceSlug,
            );

            if (!existingResource) {
                resourcesToCreate.push({
                    slug: resourceSlug,
                    name: resourceName,
                    description: resourceDescription,
                });
            }
        }

        if (resourcesToCreate.length > 0) {
            await resourceRepository.save(resourcesToCreate);
        } else {
            console.log('No new resources to create.');
        }
    }
}
