import { Injectable } from '@nestjs/common';
import { EXPORT_DATA_STRATEGY } from '../constants/export-data-strategy.constant';
import { IExportDataFormatMapServices } from '../types/export-data-strategy.type';
import { ExportDataCsvService } from './export-data-csv.service';
import { ExportDataExcelService } from './export-data-excel.service';
import { ExportDataPdfService } from './export-data-pdf.service';

@Injectable()
export class ExportDataFactoryService {
    public exportStrategy<T extends keyof IExportDataFormatMapServices>(
        type: T,
    ): IExportDataFormatMapServices[T] {
        switch (type) {
            case EXPORT_DATA_STRATEGY.EXCEL: {
                return new ExportDataExcelService() as unknown as IExportDataFormatMapServices[T];
            }
            case EXPORT_DATA_STRATEGY.CSV: {
                return new ExportDataCsvService() as unknown as IExportDataFormatMapServices[T];
            }
            case EXPORT_DATA_STRATEGY.PDF: {
                return new ExportDataPdfService() as unknown as IExportDataFormatMapServices[T];
            }
            default: {
                throw new Error(`Unsupported export strategy: ${type}`);
            }
        }
    }
}
