import {
    Body,
    Controller,
    Get,
    Logger,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { ProjectKey } from 'src/modules/iam/shared/decorators/project-key.decorator';
import { ExcludeGlobalGuard } from 'src/modules/iam/shared/decorators/public.decorator';
import { ProjectApiKeyGuard } from 'src/modules/iam/shared/guards/project-api-key.guard';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { JsonUtil } from 'src/shared/utils/json.util';
import { QueryTransactionEventCaptureV1Request } from '../dtos/requests/query-transaction-event-capture-v1.request';
import { QueryTransactionEventNotifyV1Request } from '../dtos/requests/query-transaction-event-notify-request-v1.dto';
import { QueryTransactionEventPaginationV1Request } from '../dtos/requests/query-transaction-event-paginate-v1.request';
import { QueryTransactionEventV1Response } from '../dtos/responses/query-transaction-event-v1.response';
import { QueryTransactionEventV1Service } from '../services/query-transaction-event-v1.service';

@Controller({
    path: 'query-transaction-events',
    version: '1',
})
export class QueryTransactionEventV1Controller {
    private readonly logger = new Logger(
        QueryTransactionEventV1Controller.name,
    );

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
        this.logger.debug(
            `Capturing event for projectKey: ${projectKey.id}\nRequest: ${JsonUtil.stringify(request)}`,
        );

        await this.queryTransactionEventService.captureEvent(
            projectKey,
            request,
        );

        return {
            message: 'Event captured successfully',
            data: null,
        };
    }

    @Post('notify')
    @ExcludeGlobalGuard()
    async notifyEvent(
        @Body() request: QueryTransactionEventNotifyV1Request,
    ): Promise<IBasicResponse<null>> {
        // For testing purposes only
        await this.queryTransactionEventService.notifyEvent(request.queryIds);

        return {
            message: 'Notification process triggered',
            data: null,
        };
    }

    @Get()
    async index(
        @Query() request: QueryTransactionEventPaginationV1Request,
    ): Promise<IPaginationResponse<QueryTransactionEventV1Response>> {
        const { items, meta } =
            await this.queryTransactionEventService.paginate(request);

        return {
            message: 'Events retrieved successfully',
            data: {
                items: QueryTransactionEventV1Response.FromEntities(items),
                meta,
            },
        };
    }
}
