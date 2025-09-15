import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const QueryTransactionCreateV1Schema = z.object({
    projectId: z.string().uuid(),
    signature: z.string().min(1).max(2048),
    totalExecutionTime: z.number().min(0),
    averageExecutionTime: z.number().min(0),
    maxExecutionTime: z.number().min(0),
    minExecutionTime: z.number().min(0),
    environment: z.string().min(1).max(100),
});

export class QueryTransactionCreateV1Request extends ZodUtils.createCamelCaseDto(
    QueryTransactionCreateV1Schema,
) {}
