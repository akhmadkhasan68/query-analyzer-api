import { IStorageFile } from '../../entities/interfaces/storage-file.interface';
import { IBaseSchema } from './base-schema.interface';

export interface IQueryTransactionEventAnalyzeReport extends IBaseSchema {
    queryTransactionEventId: string;
    storageFile: IStorageFile;
}
