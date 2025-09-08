import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

const PublicQueryEventCaptureV1Schema = z.object({
    queryId: z.string().uuid(),
    rawQuery: z.string(),
    parameters: z.record(z.string(), z.any()),
    executionTimeMs: z.number(),
    stackTrace: z.array(z.string()).optional(),
    timestamp: z.string().datetime(),
    contextType: z.string(),
    environment: z.string(),
    applicationName: z.string().optional(),
    version: z.string().optional(),
    executionPlan: z.object({
        databaseProvider: z.string(),
        planFormat: z.object({
            contentType: z.string(),
            fileExtension: z.string(),
            description: z.string(),
        }).optional(),
        content: z.string().optional(),
    }).optional(),
});

export class PublicQueryEventCaptureV1Request extends ZodUtils.createCamelCaseDto(
    PublicQueryEventCaptureV1Schema,
) {}