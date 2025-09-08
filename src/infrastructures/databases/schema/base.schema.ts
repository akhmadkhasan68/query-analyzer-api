import { IBaseSchema } from './interfaces/base-schema.interface';

export class BaseSchema implements IBaseSchema {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
