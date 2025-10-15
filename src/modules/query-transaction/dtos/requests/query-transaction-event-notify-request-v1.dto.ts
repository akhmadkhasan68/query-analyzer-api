import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const QueryTransactionEventNotifyV1Schema = z.object({
    queryIds: z.array(z.string().uuid()).min(1),
});

export class QueryTransactionEventNotifyV1Request extends ZodUtils.createCamelCaseDto(
    QueryTransactionEventNotifyV1Schema,
) {}
