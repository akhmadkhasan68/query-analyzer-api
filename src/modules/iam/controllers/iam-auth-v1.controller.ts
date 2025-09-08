import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { IRefreshToken } from 'src/infrastructures/databases/entities/interfaces/refresh-token.interface';
import { IUser } from 'src/infrastructures/databases/entities/interfaces/user.interface';
import { GetRefreshTokenLogged } from 'src/modules/iam/shared/decorators/get-refresh-token-logged.decorator';
import { JwtRefreshAuthGuard } from 'src/modules/iam/shared/guards/jwt-refresh-auth.guard';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { UserV1Response } from '../../user/dtos/responses/user-v1.response';
import { IamAuthV1Request } from '../dtos/requests/iam-auth-v1.request';
import { IamAuthV1Response } from '../dtos/responses/iam-auth-v1.response';
import { IamAuthV1Service } from '../services/iam-auth-v1.service';
import { GetUserLogged } from '../shared/decorators/get-user-logged.decorator';
import {
    ExcludeGlobalGuard,
    Public,
} from '../shared/decorators/public.decorator';

@Controller({
    path: 'iam/auth',
    version: '1',
})
export class IamAuthV1Controller {
    constructor(private readonly iamAuthV1Service: IamAuthV1Service) {}

    @Public()
    @Post('login')
    async login(
        @Body() request: IamAuthV1Request,
    ): Promise<IBasicResponse<IamAuthV1Response>> {
        const result = await this.iamAuthV1Service.login(
            request.email,
            request.password,
        );

        return {
            message: 'Authentication successful',
            data: IamAuthV1Response.MapEntity(result),
        };
    }

    @ExcludeGlobalGuard()
    @UseGuards(JwtRefreshAuthGuard)
    @Post('refresh-token')
    async refreshToken(
        @GetRefreshTokenLogged() refreshToken: IRefreshToken,
    ): Promise<IBasicResponse<IamAuthV1Response>> {
        const result = await this.iamAuthV1Service.refreshToken(refreshToken);

        return {
            message: 'Refresh token successful',
            data: IamAuthV1Response.MapEntity(result),
        };
    }

    @Get('me')
    async me(
        @GetUserLogged() user: IUser,
    ): Promise<IBasicResponse<UserV1Response>> {
        return {
            message: 'User information retrieved successfully',
            data: UserV1Response.FromEntity(user), // Replace with actual user data
        };
    }

    @Delete('logout')
    async logout(@GetUserLogged() user: IUser): Promise<IBasicResponse<null>> {
        await this.iamAuthV1Service.logout(user);

        return {
            message: 'Logout successful',
            data: null,
        };
    }
}
