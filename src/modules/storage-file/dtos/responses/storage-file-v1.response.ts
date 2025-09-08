import { IStorageFile } from 'src/infrastructures/databases/entities/interfaces/storage-file.interface';
import { FileUtil } from 'src/shared/utils/file.util';

export class StorageFileV1Response {
    id: string;
    name: string;
    path: string;
    size: string;
    mimetype: string;
    fileUrl: string | null;
    driver: string;

    static FromEntity(
        data: IStorageFile,
        fileUrl?: string,
    ): StorageFileV1Response {
        return {
            id: data.id,
            name: data.name,
            path: data.path,
            size: FileUtil.formatFileSizeBytes(data.size),
            mimetype: data.mimetype,
            fileUrl: fileUrl || null,
            driver: data.driver.toString(),
        };
    }
}
