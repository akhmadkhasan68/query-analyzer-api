import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

const N8nCallbackAiAnalyzeQueryTransactionEventSchema = z.object({
    fileStorageId: z.string().min(1, 'File storage ID is required'),
    slackUserId: z.string().min(1, 'Slack User ID is required'),
    slackChannelId: z.string().min(1, 'Slack Channel ID is required'),
    slackMessageTs: z.string().optional(),
    id: z.string(),
});

export class N8nCallbackAiAnalyzeQueryTransactionEventRequest extends ZodUtils.createCamelCaseDto(
    N8nCallbackAiAnalyzeQueryTransactionEventSchema,
) {}
