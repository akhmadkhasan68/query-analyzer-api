import { TWkhtmlOptions } from '../../types/options/export-data-pdf-options.type';

export interface IExportDataPdfOptions {
    isCustomTemplate: boolean;
    template: string;
    options?: TWkhtmlOptions;
}
