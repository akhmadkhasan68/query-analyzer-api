import { IExportDataCsvOptions } from './options/export-data-csv-options.interface';
import { IExportDataExcelOptions } from './options/export-data-excel-options.interface';
import { IExportDataPdfOptions } from './options/export-data-pdf-options.interface';

export interface IExportDataService<
    TData extends Record<string, any> = Record<string, any>,
    TOptions = any,
> {
    export(data: TData | TData[], options?: TOptions): Promise<Buffer>;
}

export interface IExportDataExcelService
    extends IExportDataService<Record<string, any>, IExportDataExcelOptions> {
    exportMultiSheet<T extends Record<string, any>>(
        worksheets: Array<{
            name: string;
            data: T[];
            options?: Omit<IExportDataExcelOptions, 'worksheetName'>;
        }>,
    ): Promise<Buffer>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IExportDataPdfService
    extends IExportDataService<Record<string, any>, IExportDataPdfOptions> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IExportDataCsvService
    extends IExportDataService<Record<string, any>, IExportDataCsvOptions> {}
