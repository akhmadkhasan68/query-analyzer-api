/* eslint-disable no-console */
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

export default class RolePermissionSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const permissionRepository = dataSource.getRepository(Permission);
        const roleRepository = dataSource.getRepository(Role);

        const role = await roleRepository.findOne({
            where: {
                slug: RoleEnum.SuperAdmin,
            },
        });

        if (!role) {
            console.log('No role found.');
            return;
        }

        const permissions = await permissionRepository.find();

        if (permissions.length === 0) {
            console.log('No permissions found.');
            return;
        }

        role.permissions = permissions;
        await roleRepository.save(role);
        console.log('Role permissions seeded successfully.');
    }
}
