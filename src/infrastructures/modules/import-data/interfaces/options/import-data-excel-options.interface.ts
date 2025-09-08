export interface IImportDataExcelOptions {
    sheetName?: string;
    headerRow: number;
    columnMapping: Record<string, string>;
    validateTemplate: string;
}
