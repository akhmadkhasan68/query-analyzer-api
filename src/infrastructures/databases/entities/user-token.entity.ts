import { Column, Entity, ManyToOne } from 'typeorm';
import { UserTokenTypeEnum } from '../../../shared/enums/user-token.enum';
import { BaseEntity } from './base.entity';
import { IUserToken } from './interfaces/user-token.interface';
import { IUser } from './interfaces/user.interface';
import { User } from './user.entity';

@Entity('user_tokens')
export class UserToken extends BaseEntity implements IUserToken {
    @ManyToOne(() => User, (user) => user.userTokens)
    user?: IUser;

    @Column({
        unique: true,
    })
    token: string;

    @Column({
        type: 'timestamp',
    })
    expiresAt: Date;

    @Column({
        type: 'varchar',
        default: UserTokenTypeEnum.RefreshToken,
    })
    type: UserTokenTypeEnum;
}
