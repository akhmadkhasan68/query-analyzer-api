import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IamForgotPasswordResetV1Request } from '../dtos/requests/iam-forgot-password-reset-v1.request';
import { IamForgotPasswordV1Request } from '../dtos/requests/iam-forgot-password-v1.request';
import { IamForgotPasswordVerifyV1Request } from '../dtos/requests/iam-forgot-password-verify-v1.request';
import { IamForgotPasswordV1Service } from '../services/iam-forgot-password-v1.service';
import { Public } from '../shared/decorators/public.decorator';

@Controller({
    path: 'iam/forgot-password',
    version: '1',
})
export class IamForgotPasswordV1Controller {
    constructor(
        private readonly iamForgotPasswordService: IamForgotPasswordV1Service,
    ) {}

    @Public()
    @Post('request')
    @HttpCode(HttpStatus.OK)
    async request(
        @Body() request: IamForgotPasswordV1Request,
    ): Promise<IBasicResponse<null>> {
        await this.iamForgotPasswordService.requestForgotPassword(
            request.email,
            request.redirectUrl,
        );

        return {
            message: 'Request for password reset was successful',
            data: null,
        };
    }

    @Public()
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verify(
        @Body() request: IamForgotPasswordVerifyV1Request,
    ): Promise<IBasicResponse<null>> {
        await this.iamForgotPasswordService.verifyForgotPasswordToken(
            request.token,
        );

        return {
            message: 'Token verification was successful',
            data: null,
        };
    }

    @Public()
    @Post('reset')
    @HttpCode(HttpStatus.OK)
    async reset(
        @Body() request: IamForgotPasswordResetV1Request,
    ): Promise<IBasicResponse<null>> {
        await this.iamForgotPasswordService.resetPassword(
            request.token,
            request.password,
        );

        return {
            message: 'Password reset was successful',
            data: null,
        };
    }
}
