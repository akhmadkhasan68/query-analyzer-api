import { Injectable, Logger } from '@nestjs/common';
import { config } from 'src/config';
import { HttpIntegrationV1Service } from 'src/infrastructures/integrations/http/http-integration-v1.service';
import { QueryTransactionEventV1Service } from 'src/modules/query-transaction/services/query-transaction-event-v1.service';
import { N8nCallbackAiAnalyzeQueryTransactionEventRequest } from '../dtos/requests/n8n-callback-ai-analyze-query-transaction-event.request';
import { TN8nWebhookDto } from '../shared/dtos/webhook/n8n-webhook.dto';
import { N8nWebhookIdEnum } from '../shared/enums/n8n-webhook-id.enum';

@Injectable()
export class N8nWebhookV1Service {
    constructor(
        private readonly httpIntegration: HttpIntegrationV1Service,
        private readonly queryTransactionEventService: QueryTransactionEventV1Service,
    ) {}

    private readonly logger = new Logger(N8nWebhookV1Service.name);

    async triggerWebhook(
        webhookId: N8nWebhookIdEnum,
        data: TN8nWebhookDto,
    ): Promise<void> {
        let url: string;
        if (!config.app.isDevelopment) {
            url = `/webhook/${webhookId}`;
        } else {
            url = `/webhook-test/${webhookId}`;
        }

        this.logger.log(`Triggering webhook: ${url}`);

        try {
            await this.httpIntegration.post(url, data);
        } catch (error) {
            this.logger.error(`Failed to trigger webhook: ${error.message}`);

            throw error;
        }
    }

    async handleCallbackAIAnalyzeQueryTransactionEvent(
        body: N8nCallbackAiAnalyzeQueryTransactionEventRequest,
    ): Promise<void> {
        this.logger.log(
            `Received AI Analyze Callback for Event ID: ${body.id}`,
        );

        const aiAnalyzeReport =
            await this.queryTransactionEventService.saveAIAnalyzeReport(
                body.id,
                body.fileStorageId,
            );

        // Send pushback Slack notification message to requester user
        await this.queryTransactionEventService.sendAIAnalyzeReportToRequester(
            body.id,
            aiAnalyzeReport,
            body.slackUserId,
            body.slackChannelId,
            body.slackMessageTs,
        );

        console.log('Callback Body:', body);
    }
}
