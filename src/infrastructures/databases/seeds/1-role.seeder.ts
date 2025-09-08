/* eslint-disable no-console */
import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { StringUtil } from '../../../shared/utils/string.util';
import { IRole } from '../entities/interfaces/role.interface';
import { Role } from '../entities/role.entity';

export default class RoleSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const roleRepository = dataSource.getRepository(Role);

        const roles: string[] = Object.values(RoleEnum).map((value): string => {
            return value;
        });

        // Existing roles
        const existingRoles = await roleRepository.find({
            where: {
                slug: In(roles),
            },
        });

        const rolesToCreate: Partial<IRole>[] = [];
        const rolesToUpdate: Partial<IRole>[] = [];

        if (existingRoles.length > 0) {
            const existingSlugs = existingRoles.map((role) => role.slug);

            const existingRolesToUpdate = existingRoles.map((role) => {
                const roleName = StringUtil.slugToTitleCase(role.slug);

                return {
                    ...role,
                    name: roleName,
                    description: `${roleName} role`,
                };
            });

            rolesToUpdate.push(...existingRolesToUpdate);

            const newRoles = roles.filter(
                (role) => !existingSlugs.includes(role),
            );

            if (newRoles.length > 0) {
                const newRolesToCreate = newRoles.map(
                    (role): Partial<IRole> => {
                        const roleName = StringUtil.slugToTitleCase(role);

                        return {
                            slug: role,
                            name: roleName,
                            description: `${roleName} role`,
                        };
                    },
                );
                rolesToCreate.push(...newRolesToCreate);
            }
        } else {
            const newRolesToCreate = roles.map((role): Partial<IRole> => {
                const roleName = StringUtil.slugToTitleCase(role);

                return {
                    slug: role,
                    name: roleName,
                    description: `${roleName} role`,
                };
            });

            rolesToCreate.push(...newRolesToCreate);
        }

        if (rolesToCreate.length === 0) {
            console.log('No new roles to create.');
            return;
        }

        if (rolesToUpdate.length > 0) {
            await roleRepository.save(rolesToUpdate);
        }

        await roleRepository.save(rolesToCreate);
    }
}
