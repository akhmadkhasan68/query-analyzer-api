/* eslint-disable no-console */
import * as fs from 'fs';
import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { IUser } from '../entities/interfaces/user.interface';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';

interface IUserSuperadmin {
    fullname: string;
    email: string;
    password: string;
    phone_number: string;
}

export default class UserSuperadminSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const roleRepository = dataSource.getRepository(Role);
        const userRepository = dataSource.getRepository(User);

        const jsonData = fs.readFileSync(
            `${__dirname}/data/user-superadmin.json`,
            'utf-8',
        );
        const usersData = JSON.parse(jsonData) as IUserSuperadmin[];

        const role = await roleRepository.findOne({
            where: {
                slug: RoleEnum.SuperAdmin,
            },
        });

        if (!role) {
            console.log('No role found.');
            return;
        }

        const users = usersData as IUserSuperadmin[];

        if (users.length === 0) {
            console.log('No users found.');
            return;
        }

        // Existing User by Email
        const existingUsers = await userRepository.find({
            where: {
                email: In(users.map((user) => user.email)),
            },
        });

        const userToCreate: IUserSuperadmin[] = [];
        if (existingUsers.length > 0) {
            const existingUserEmails = existingUsers.map((user) => user.email);
            const newUsers = users.filter(
                (user) => !existingUserEmails.includes(user.email),
            );
            userToCreate.push(...newUsers);
        } else {
            userToCreate.push(...users);
        }

        if (userToCreate.length == 0) {
            console.log('No new users to create.');
            return;
        }

        const usersToInsert: Partial<IUser>[] = userToCreate.map(
            (user): Partial<IUser> => {
                return {
                    fullname: user.fullname,
                    email: user.email,
                    password: user.password,
                    phoneNumber: user.phone_number,
                    roles: [role],
                };
            },
        );

        await userRepository.save(userRepository.create(usersToInsert));
        console.log('User superadmin seeded successfully.');
    }
}
