import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { config } from 'src/config';
import { IRefreshToken } from 'src/infrastructures/databases/entities/interfaces/refresh-token.interface';
import { IUser } from 'src/infrastructures/databases/entities/interfaces/user.interface';
import { UserV1Repository } from 'src/modules/user/repositories/user-v1.repository';
import { UserTokenTypeEnum } from 'src/shared/enums/user-token.enum';
import { DateTimeUtil } from 'src/shared/utils/datetime.util';
import { HashUtil } from 'src/shared/utils/hash.util';
import { UserTokenV1Repository } from '../../user/repositories/user-token-v1.repository';
import { IAuthResultData } from '../shared/interfaces/auth-result-data.interface';
import { IJwtPayload } from '../shared/interfaces/jwt-payload.interface';
import { IJwtRefreshPayload } from '../shared/interfaces/jwt-refresh-payload.interface';

@Injectable()
export class IamAuthV1Service {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userV1Repository: UserV1Repository,
        private readonly userTokenV1Repository: UserTokenV1Repository,
    ) {}

    private readonly JWT_SECRET = config.jwt.secret;
    private readonly JWT_EXPIRES_IN_SECONDS = config.jwt.expiresInSeconds;
    private readonly JWT_REFRESH_TOKEN_SECRET = config.jwt.refreshTokenSecret;
    private readonly JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS =
        config.jwt.refreshTokenExpiresInSeconds;

    /**
     * Generates a JWT token for the given user.
     * @param user The user object containing user information.
     * @returns A promise that resolves to the generated JWT token.
     */
    async login(email: string, password: string): Promise<IAuthResultData> {
        // Find the user by email or phone number
        const user =
            await this.userV1Repository.findOneByEmailOrPhoneNumber(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if the password is correct
        const isPasswordValid = await HashUtil.compareHashBcrypt(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const refreshTokenUuid = randomUUID();

        // If authentication is successful, generate a JWT token
        const [token, refreshToken] = await Promise.all([
            this.generateToken(user),
            this.generateRefreshToken(refreshTokenUuid),
        ]);

        // Save the refresh token to the database
        await this.saveRefreshToken(user, refreshToken, refreshTokenUuid);

        return {
            user,
            token: {
                accessToken: token,
                accessTokenExpiresIn: DateTimeUtil.addSeconds(
                    new Date(),
                    this.JWT_EXPIRES_IN_SECONDS,
                ),
                refreshToken: refreshToken,
                refreshTokenExpiresIn: DateTimeUtil.addSeconds(
                    new Date(),
                    this.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS,
                ), // 1 day
            },
        };
    }

    /**
     * Refreshes the JWT token using the provided refresh token.
     * @param refreshToken The refresh token object containing the token and user information.
     * @returns A promise that resolves to the new JWT token and refresh token.
     * @throws UnauthorizedException if the refresh token is expired or invalid.
     */
    async refreshToken(refreshToken: IRefreshToken): Promise<IAuthResultData> {
        // Check if the refresh token is expired
        const isExpired = refreshToken.expiresAt < new Date();
        if (isExpired) {
            throw new UnauthorizedException('Refresh token expired');
        }

        if (!refreshToken.user) {
            throw new UnauthorizedException('User not found');
        }

        // Generate a new JWT token
        const token = await this.generateToken(refreshToken.user);

        return {
            user: refreshToken.user,
            token: {
                accessToken: token,
                accessTokenExpiresIn: DateTimeUtil.addSeconds(
                    new Date(),
                    this.JWT_EXPIRES_IN_SECONDS,
                ), // 1 hour
                refreshToken: refreshToken.token,
                refreshTokenExpiresIn: refreshToken.expiresAt,
            },
        };
    }

    async logout(user: IUser): Promise<void> {
        // Check if the user refresh tokens exist
        const refreshTokens = await this.userTokenV1Repository.find({
            where: {
                user: { id: user.id },
                type: UserTokenTypeEnum.RefreshToken,
            },
        });
        if (refreshTokens.length === 0) {
            return;
        }

        // Delete all refresh tokens for the user
        await this.userTokenV1Repository.softDelete({
            user: { id: user.id },
        });
    }

    /**
     * Generates a JWT token for the given user.
     * @param user The user object containing user information.
     * @returns A promise that resolves to the generated JWT token.
     */
    private async generateToken(user: IUser): Promise<string> {
        const payload: IJwtPayload = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
        };

        return await this.jwtService.signAsync(payload, {
            expiresIn: this.JWT_EXPIRES_IN_SECONDS,
            secret: this.JWT_SECRET,
        });
    }

    /**
     *
     * @param user The user object containing user information.
     * @description Generates a refresh token for the given user.
     * @returns A promise that resolves to the generated refresh token.
     */
    private async generateRefreshToken(uuid: string): Promise<string> {
        const payload: IJwtRefreshPayload = {
            id: uuid,
        };

        return await this.jwtService.signAsync(payload, {
            expiresIn: this.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS,
            secret: this.JWT_REFRESH_TOKEN_SECRET,
        });
    }

    private async saveRefreshToken(
        user: IUser,
        refreshToken: string,
        refreshTokenUuid: string,
    ): Promise<void> {
        const data = this.userTokenV1Repository.create({
            user,
            token: refreshToken,
            id: refreshTokenUuid,
            expiresAt: DateTimeUtil.addSeconds(
                new Date(),
                this.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS,
            ),
            type: UserTokenTypeEnum.RefreshToken,
        });

        // Save the refresh token to the database
        await this.userTokenV1Repository.save(data);
    }
}
