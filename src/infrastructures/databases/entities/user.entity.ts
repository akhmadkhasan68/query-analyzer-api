import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
} from 'typeorm';
import { HashUtil } from '../../../shared/utils/hash.util';
import { BaseEntity } from './base.entity';
import { IRole } from './interfaces/role.interface';
import { IUserToken } from './interfaces/user-token.interface';
import { IUser } from './interfaces/user.interface';
import { Role } from './role.entity';
import { UserToken } from './user-token.entity';

@Entity('users')
export class User extends BaseEntity implements IUser {
    @Column()
    fullname: string;

    @Column({
        unique: true,
    })
    email: string;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    emailVerifiedAt?: Date;

    @Column()
    password: string;

    @Column({
        unique: true,
    })
    phoneNumber: string;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    phoneNumberVerifiedAt?: Date;

    @ManyToMany(() => Role)
    @JoinTable({ name: 'user_roles' })
    roles?: IRole[];

    @OneToMany(() => UserToken, (userToken) => userToken.user)
    userTokens?: IUserToken[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            this.password = await HashUtil.hashBcrypt(this.password);
        }
    }
}
