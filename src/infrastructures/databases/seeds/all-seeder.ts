import { runSeeders } from 'typeorm-extension';
import dataSource from '../config';

(async () => {
    await dataSource.initialize();

    runSeeders(dataSource, {
        seeds: [
            'src/infrastructures/databases/seeds/**/*{.seeder.ts,.seeder.js}',
        ],
        factories: [
            'src/infrastructures/databases/factories/**/*{.factory.ts,.factory.js}',
        ],
    });
})();
