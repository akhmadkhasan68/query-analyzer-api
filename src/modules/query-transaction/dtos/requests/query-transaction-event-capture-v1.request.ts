import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const SlowQueryReportExecutionPlanFormatSchema = z.object({
    contentType: z.string(),
    fileExtension: z.string(),
    description: z.string(),
});

export const SlowQueryReportExecutionPlanSchema = z.object({
    databaseProvider: z.string(),
    planFormat: SlowQueryReportExecutionPlanFormatSchema.optional(),
    content: z.string().optional(),
});

export const QueryTransactionEventCaptureV1Schema = z.object({
    queryId: z.string().uuid(),
    rawQuery: z.string(),
    parameters: z.record(z.any()),
    executionTimeMs: z.number(),
    stackTrace: z.array(z.string()).optional(),
    timestamp: z.string().transform((str) => new Date(str)),
    contextType: z.string(),
    environment: z.string(),
    applicationName: z.string().optional(),
    version: z.string().optional(),
    executionPlan: SlowQueryReportExecutionPlanSchema.optional().nullable(),
});

export class QueryTransactionEventCaptureV1Request extends ZodUtils.createCamelCaseDto(
    QueryTransactionEventCaptureV1Schema,
) {}
