import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const QueryTransactionEventAiAnalyzeV1Schema = z.object({
    ids: z.array(z.string().uuid()).min(1, 'At least one ID is required'),
    slackUserId: z.string().min(1, 'Slack User ID is required'),
    slackChannelId: z.string().min(1, 'Slack Channel ID is required'),
    slackMessageTs: z.string().optional(),
});

export class QueryTransactionEventAiAnalyzeV1Request extends ZodUtils.createCamelCaseDto(
    QueryTransactionEventAiAnalyzeV1Schema,
) {}
