import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'src/config';
import { IUser } from 'src/infrastructures/databases/entities/interfaces/user.interface';
import { UserV1Repository } from '../../../user/repositories/user-v1.repository';
import { JwtAuthTypeEnum } from '../enums/token-type.enum';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    JwtAuthTypeEnum.AccessToken,
) {
    constructor(private readonly userRepository: UserV1Repository) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.jwt.secret,
        });
    }

    async validate(payload: IJwtPayload): Promise<IUser> {
        const { id } = payload;
        const user = await this.userRepository.findOneByIdWithRelations(id);

        if (!user) {
            throw new UnauthorizedException('Unauthorized');
        }

        return user;
    }
}
