import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const QueryTransactionCreateV1Schema = z.object({
    projectId: z.string().uuid(),
});

export class QueryTransactionCreateV1Request extends ZodUtils.createCamelCaseDto(
    QueryTransactionCreateV1Schema,
) {}
