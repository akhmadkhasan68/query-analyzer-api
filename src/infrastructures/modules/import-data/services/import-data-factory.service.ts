import { Injectable } from '@nestjs/common';
import { IMPORT_DATA_STRATEGY } from '../constants/import-data-strategy.constant';
import { IImportDataFormatMapServices } from '../types/import-data-strategy.type';
import { ImportDataExcelService } from './import-data-excel.service';
import { ImportDataCsvService } from './import-data-csv.service';

@Injectable()
export class ImportDataFactoryService {
    public importStrategy<T extends keyof IImportDataFormatMapServices>(
        type: T,
    ): IImportDataFormatMapServices[T] {
        switch (type) {
            case IMPORT_DATA_STRATEGY.EXCEL: {
                return new ImportDataExcelService() as unknown as IImportDataFormatMapServices[T];
            }
            case IMPORT_DATA_STRATEGY.CSV: {
                return new ImportDataCsvService() as unknown as IImportDataFormatMapServices[T];
            }
            default: {
                throw new Error(`Unsupported import strategy: ${type}`);
            }
        }
    }
}
