import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthTypeEnum } from 'src/modules/iam/shared/enums/token-type.enum';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { QueryTransactionCreateV1Request } from '../dtos/requests/query-transaction-create-v1.request';
import { QueryTransactionV1Response } from '../dtos/responses/query-transaction-v1.response';
import { QueryTransactionV1Service } from '../services/query-transaction-v1.service';

@Controller({
    path: 'query-transactions',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class QueryTransactionV1Controller {
    constructor(
        private readonly queryTransactionV1Service: QueryTransactionV1Service,
    ) {}

    @Post()
    async createTransaction(
        @Body() data: QueryTransactionCreateV1Request,
    ): Promise<IBasicResponse<QueryTransactionV1Response>> {
        const result =
            await this.queryTransactionV1Service.createTransaction(data);

        return {
            data: QueryTransactionV1Response.FromEntity(result),
            message: 'Successfully created query transaction',
        };
    }
}
