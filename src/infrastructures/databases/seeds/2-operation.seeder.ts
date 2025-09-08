/* eslint-disable no-console */
import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { OPERATION } from '../../../shared/constants/permission.constant';
import { StringUtil } from '../../../shared/utils/string.util';
import { IOperation } from '../entities/interfaces/operation.interface';
import { Operation } from '../entities/operation.entity';

export default class OperationSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const operationRepository = dataSource.getRepository(Operation);

        const operationSlugs = Object.values(OPERATION);

        // Existing operations
        const existingOperations = await operationRepository.find({
            where: {
                slug: In(operationSlugs),
            },
        });

        // Create Operations
        const operationsToCreate: Partial<IOperation>[] = [];
        for (const operationKey of operationSlugs) {
            const name = StringUtil.slugToTitleCase(operationKey);
            const slug = operationKey;

            const existingOperation = existingOperations.find(
                (operation) => operation.slug === slug,
            );

            if (!existingOperation) {
                operationsToCreate.push({
                    slug: slug,
                    name: name,
                });
            }
        }

        if (operationsToCreate.length > 0) {
            await operationRepository.save(operationsToCreate);
        } else {
            console.log('No new operations to create.');
        }
    }
}
