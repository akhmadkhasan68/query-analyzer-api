import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';
import { QueryTransactionSeverityEnum } from '../../shared/enums/query-transaction-severity.enum';

export const QueryTransactionEventPaginationV1Schema = PaginateSchema.extend({
    severity: z.nativeEnum(QueryTransactionSeverityEnum).optional(),
});

export class QueryTransactionEventPaginationV1Request extends ZodUtils.createCamelCaseDto(
    QueryTransactionEventPaginationV1Schema,
) {}
