/* eslint-disable no-console */
import * as fs from 'fs';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { IPlatform } from '../entities/interfaces/platform.interface';
import { Platform } from '../entities/platform.entity';

export default class PlatformSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const platformRepository = dataSource.getRepository(Platform);

        const jsonData = fs.readFileSync(
            `${__dirname}/data/platform.json`,
            'utf-8',
        );
        const platformsData = JSON.parse(jsonData) as IPlatform[];

        if (platformsData.length === 0) {
            console.log('No platforms found.');
            return;
        }

        // Existing Platform by framework, ormProvider, databaseProvider
        const existingPlatforms = await platformRepository.find();
        const platformToCreate: IPlatform[] = [];

        for (const platformData of platformsData) {
            const existingPlatform = existingPlatforms.find(
                (platform) =>
                    platform.framework === platformData.framework &&
                    platform.ormProvider === platformData.ormProvider &&
                    platform.databaseProvider === platformData.databaseProvider,
            );

            if (!existingPlatform) {
                platformToCreate.push(platformData);
            }
        }

        if (platformToCreate.length > 0) {
            await platformRepository.save(platformToCreate);
        }

        console.log(`Inserted ${platformToCreate.length} new platforms.`);
        console.log('Platform seeding completed.');
    }
}
