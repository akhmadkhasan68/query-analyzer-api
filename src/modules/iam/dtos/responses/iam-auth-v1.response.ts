import { IAuthResultData } from 'src/modules/iam/shared/interfaces/auth-result-data.interface';
import { ITokenResultData } from 'src/modules/iam/shared/interfaces/token-result-data.interface';
import { UserV1Response } from '../../../user/dtos/responses/user-v1.response';

export class IamAuthV1Response {
    user: UserV1Response;
    token: ITokenResultData;

    static MapEntity(entity: IAuthResultData): IamAuthV1Response {
        return {
            user: UserV1Response.FromEntity(entity.user),
            token: {
                accessToken: entity.token.accessToken,
                accessTokenExpiresIn: entity.token.accessTokenExpiresIn,
                refreshToken: entity.token.refreshToken,
                refreshTokenExpiresIn: entity.token.refreshTokenExpiresIn,
            },
        };
    }
}
