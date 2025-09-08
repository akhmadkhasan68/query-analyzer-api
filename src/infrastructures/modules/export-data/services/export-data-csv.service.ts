import { InternalServerErrorException } from '@nestjs/common';
import {
    IExportDataCsvService,
} from '../interfaces/export-data-service.interface';
import { IExportDataCsvOptions } from '../interfaces/options/export-data-csv-options.interface';

/**
 * Service for exporting data to CSV format
 * This service implements the IExportDataService interface
 * and provides methods to export data in CSV format.
 * It uses a custom CSV writer to handle CSV file creation and manipulation.
 * @implements {IExportDataService}
 * @class ExportDataCsvService
 */
export class ExportDataCsvService implements IExportDataCsvService {
    async export(
        data: Record<string, any>[] | Record<string, any>,
        options?: IExportDataCsvOptions,
    ): Promise<Buffer> {
        // Validate input type
        if (!Array.isArray(data)) {
            throw new InternalServerErrorException(
                'Data must be an array of objects for CSV export',
            );
        }

        if (!this.validateExportData(data)) {
            throw new InternalServerErrorException(
                'Invalid data format for CSV export',
            );
        }

        if (data.length === 0) {
            return Buffer.from('');
        }

        const headers = this.setHeader(data, options);
        const delimiter = this.setDelimiter(options);
        const transformedData = this.setDataRows(data, headers);

        const rows: string[] = [];

        // Header row
        rows.push(headers.map((h) => `${h.title}`).join(delimiter));

        // Data rows
        for (const row of transformedData) {
            const values = headers.map((header) => {
                const raw = row[header.id];
                const str = String(raw ?? '').replace(/"/g, '""');
                return `${str}`;
            });
            rows.push(values.join(delimiter));
        }

        // Prepend BOM (UTF-8 signature)
        const csvContent = '\ufeff' + rows.join('\n');

        return Buffer.from(csvContent, 'utf8');
    }

    private validateExportData<T extends Record<string, any>>(
        data: T[],
    ): boolean {
        return data.every(
            (item) =>
                item !== null &&
                typeof item === 'object' &&
                !Array.isArray(item),
        );
    }

    private setHeader(
        data: Record<string, any>[],
        options?: IExportDataCsvOptions,
    ): Array<{ id: string; title: string }> {
        const rawHeaders = options?.headers?.length
            ? options.headers
            : Object.keys(data[0]);

        return rawHeaders.map((header) => ({
            id: header,
            title: header,
        }));
    }

    private setDelimiter(options?: IExportDataCsvOptions): string {
        return options?.delimiter || ';';
    }

    private setDataRows(
        data: Record<string, any>[],
        headers: Array<{ id: string; title: string }>,
    ): Record<string, any>[] {
        return data.map((item) => {
            const values = Object.values(item);
            const transformed: Record<string, any> = {};
            headers.forEach((header, index) => {
                transformed[header.id] =
                    values[index] !== undefined ? values[index] : '';
            });
            return transformed;
        });
    }
}
