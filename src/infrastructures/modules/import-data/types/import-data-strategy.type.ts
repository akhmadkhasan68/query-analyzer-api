import { IMPORT_DATA_STRATEGY } from '../constants/import-data-strategy.constant';
import { IImportDataCsvService, IImportDataExcelService } from '../interfaces/import-data-service.interface';

export type TImportDataStrategy =
    (typeof IMPORT_DATA_STRATEGY)[keyof typeof IMPORT_DATA_STRATEGY];

export interface IImportDataFormatMapServices {
    [IMPORT_DATA_STRATEGY.EXCEL]: IImportDataExcelService;
    [IMPORT_DATA_STRATEGY.CSV]: IImportDataCsvService;
}
