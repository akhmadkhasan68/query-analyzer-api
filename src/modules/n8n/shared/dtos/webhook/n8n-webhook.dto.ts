export class N8nWebhookAiAnalyzeQueryTransactionEventDto {
    id: string;
    slackUserId: string;
    slackChannelId: string;
    slackMessageTs?: string;
}

export type TN8nWebhookDto = N8nWebhookAiAnalyzeQueryTransactionEventDto;
