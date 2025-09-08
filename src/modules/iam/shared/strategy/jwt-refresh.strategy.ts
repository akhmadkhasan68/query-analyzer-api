import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'src/config';
import { IRefreshToken } from 'src/infrastructures/databases/entities/interfaces/refresh-token.interface';
import { UserTokenTypeEnum } from 'src/shared/enums/user-token.enum';
import { UserTokenV1Repository } from '../../../user/repositories/user-token-v1.repository';
import { JwtAuthTypeEnum } from '../enums/token-type.enum';
import { IJwtRefreshPayload } from '../interfaces/jwt-refresh-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    JwtAuthTypeEnum.RefreshToken,
) {
    constructor(private readonly userTokenV1Repository: UserTokenV1Repository) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.jwt.refreshTokenSecret,
        });
    }

    async validate(payload: IJwtRefreshPayload): Promise<IRefreshToken> {
        const { id } = payload;

        const refreshToken =
            await this.userTokenV1Repository.findOneByIdAndTypeWithRelations(
                id,
                UserTokenTypeEnum.RefreshToken,
            );

        if (!refreshToken) {
            throw new UnauthorizedException('Unauthorized');
        }

        // Check if the refresh token is expired
        const isExpired = refreshToken.expiresAt < new Date();
        if (isExpired) {
            throw new UnauthorizedException('Refresh token expired');
        }

        if (!refreshToken.user) {
            throw new UnauthorizedException('User not found');
        }

        return refreshToken;
    }
}
