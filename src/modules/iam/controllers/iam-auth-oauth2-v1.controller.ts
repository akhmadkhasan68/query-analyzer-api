import { Body, Controller, Get, Post } from '@nestjs/common';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IamAuthOauth2V1Request } from '../dtos/requests/iam-auth-oauth2-v1.request';
import { IamAuthV1Response } from '../dtos/responses/iam-auth-v1.response';
import { IamAuthV1Service } from '../services/iam-auth-v1.service';
import { Public } from '../shared/decorators/public.decorator';

@Controller({
    path: 'iam/auth/oauth2',
    version: '1',
})
@Public()
export class IamAuthOAuth2V1Controller {
    constructor(private readonly authV1Service: IamAuthV1Service) {}

    @Get('url')
    async getOauth2Url(): Promise<IBasicResponse<{ url: string }>> {
        const url = await this.authV1Service.getOauth2LoginUrl();

        return {
            message: 'OAuth2 authorization URL generated successfully.',
            data: { url },
        };
    }

    @Post()
    async oauth2Login(
        @Body() body: IamAuthOauth2V1Request,
    ): Promise<IBasicResponse<IamAuthV1Response>> {
        const result = await this.authV1Service.oauth2Login(body.code);

        return {
            message: 'Login via OAuth2 successful.',
            data: IamAuthV1Response.MapEntity(result),
        };
    }
}
