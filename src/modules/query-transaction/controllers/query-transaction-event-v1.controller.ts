import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { ProjectKey } from 'src/modules/iam/shared/decorators/project-key.decorator';
import { ExcludeGlobalGuard } from 'src/modules/iam/shared/decorators/public.decorator';
import { ProjectApiKeyGuard } from 'src/modules/iam/shared/guards/project-api-key.guard';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { QueryTransactionEventCaptureV1Request } from '../dtos/requests/query-transaction-event-capture-v1.request';
import { QueryTransactionEventV1Service } from '../services/query-transaction-event-v1.service';

@Controller({
    path: 'query-transaction-events',
    version: '1',
})
export class QueryTransactionEventV1Controller {
    constructor(
        private readonly queryTransactionEventService: QueryTransactionEventV1Service,
    ) {}

    @Post('capture')
    @ExcludeGlobalGuard()
    @UseGuards(ProjectApiKeyGuard)
    async captureEvent(
        @ProjectKey() projectKey: IProjectKey,
        @Body() request: QueryTransactionEventCaptureV1Request,
    ): Promise<IBasicResponse<null>> {
        await this.queryTransactionEventService.captureEvent(
            projectKey,
            request,
        );

        return {
            message: 'Event captured successfully',
            data: null,
        };
    }
}
