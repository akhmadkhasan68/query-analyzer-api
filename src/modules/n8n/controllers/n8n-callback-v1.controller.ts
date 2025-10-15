import { Body, Controller, Post } from '@nestjs/common';
import { ExcludeGlobalGuard } from 'src/modules/iam/shared/decorators/public.decorator';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { N8nCallbackAiAnalyzeQueryTransactionEventRequest } from '../dtos/requests/n8n-callback-ai-analyze-query-transaction-event.request';
import { N8nWebhookV1Service } from '../services/n8n-webhook-v1.service';

@Controller({
    path: 'n8n/callback',
    version: '1',
})
export class N8nCallbackV1Controller {
    constructor(private readonly n8nWebhookV1Service: N8nWebhookV1Service) {}

    @Post('ai-analyze-query-transaction-event')
    @ExcludeGlobalGuard()
    async handleCallbackAIAnalyzeQueryTransactionEvent(
        @Body() body: N8nCallbackAiAnalyzeQueryTransactionEventRequest,
    ): Promise<IBasicResponse<any>> {
        this.n8nWebhookV1Service.handleCallbackAIAnalyzeQueryTransactionEvent(
            body,
        );

        return {
            message: 'Callback received',
            data: null,
        };
    }
}
