import { IImportDataExcelOptions } from './options/import-data-excel-options.interface';
import { IValidateImportDataExcelOptions } from './options/validate-import-data-excel-options.interface';
import { IImportDataCsvOptions } from './options/import-data-csv-options.interface';
import { IValidateImportDataCsvOptions } from './options/validate-import-data-csv-options.interface';

export interface IImportDataService<
    TData extends Record<string, any> = Record<string, any>,
    TOptions = any,
> {
    import(fileBuffer: Buffer, options?: TOptions): Promise<TData>;
}

export interface IImportDataExcelService<
    TData extends Record<string, any> = Record<string, any>,
> extends IImportDataService<TData[], IImportDataExcelOptions> {
    importMultiSheet(
        file: Buffer,
        options: IImportDataExcelOptions,
    ): Promise<TData[]>;

    validateTemplate(
        file: Buffer,
        options: IValidateImportDataExcelOptions,
    ): Promise<void>;
}

export interface IImportDataCsvService<
    TData extends Record<string, any> = Record<string, any>,
> extends IImportDataService<TData[], IImportDataCsvOptions> {
    validateTemplate(
        file: Buffer,
        options: IValidateImportDataCsvOptions,
    ): Promise<void>;
}
