import { EXPORT_DATA_STRATEGY } from '../constants/export-data-strategy.constant';
import {
    IExportDataCsvService,
    IExportDataExcelService,
    IExportDataPdfService,
} from '../interfaces/export-data-service.interface';

export type TExportDataStrategy =
    (typeof EXPORT_DATA_STRATEGY)[keyof typeof EXPORT_DATA_STRATEGY];

export interface IExportDataFormatMapServices {
    [EXPORT_DATA_STRATEGY.EXCEL]: IExportDataExcelService;
    [EXPORT_DATA_STRATEGY.CSV]: IExportDataCsvService;
    [EXPORT_DATA_STRATEGY.PDF]: IExportDataPdfService;
}
