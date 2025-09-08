export interface IImportDataCsvOptions {
    delimiter?: string;
    headerRow?: number;
    columnMapping: Record<string, string>;
    validateTemplate?: string;
}
