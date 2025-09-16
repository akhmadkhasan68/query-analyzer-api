import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const PlatformCreateV1Schema = z.object({
    framework: z.string().min(2).max(100),
    ormProvider: z.string().min(2).max(100),
    databaseProvider: z.string().min(2).max(100),
});

export const PlatformDeleteByIdsV1Schema = z.object({
    ids: z.array(z.string()),
});

export const PlatformUpdateV1Schema = PlatformCreateV1Schema;

export class PlatformCreateV1Request extends ZodUtils.createCamelCaseDto(
    PlatformCreateV1Schema,
) {}

export class PlatformUpdateV1Request extends ZodUtils.createCamelCaseDto(
    PlatformUpdateV1Schema,
) {}

export class PlatformDeleteByIdsV1Request extends ZodUtils.createCamelCaseDto(
    PlatformDeleteByIdsV1Schema,
) {}
