import { InternalServerErrorException } from '@nestjs/common';
import * as exceljs from 'exceljs';
import { IExportDataExcelService } from '../interfaces/export-data-service.interface';
import { IExportDataExcelOptions } from '../interfaces/options/export-data-excel-options.interface';

/**
 * Service for exporting data to Excel format
 * This service implements the IExportDataExcelService interface
 * and provides methods to export single and multi-sheet Excel files.
 * It uses the exceljs library to handle Excel file creation and manipulation.
 * @implements {IExportDataExcelService}
 * @class ExportDataExcelService
 */
export class ExportDataExcelService implements IExportDataExcelService {
    private readonly DEFAULT_WORKSHEET_NAME = 'Sheet1';

    /**
     * Generate a single-sheet Excel file
     * @param data - Data to be exported
     * @param options - Options for Excel export
     * @returns {Promise<Buffer>} - Buffer containing the Excel file
     * @throws {InternalServerErrorException} - If data format is invalid
     */
    async export(
        data: Record<string, any>[] | Record<string, any>,
        options?: IExportDataExcelOptions | undefined,
    ): Promise<Buffer> {
        if (!Array.isArray(data)) {
            throw new InternalServerErrorException(
                'Data must be an array of objects for Excel export',
            );
        }

        // Validate the data format
        if (!this.validateExportData(data)) {
            throw new InternalServerErrorException(
                'Invalid data format for Excel export',
            );
        }

        const workbook = new exceljs.Workbook();
        const worksheetName =
            options?.worksheetName || this.DEFAULT_WORKSHEET_NAME;
        const worksheet = workbook.addWorksheet(worksheetName);

        // If no data is provided, return an empty Excel file
        if (data.length === 0) {
            return Buffer.from(await workbook.xlsx.writeBuffer());
        }

        // Set the headers for the worksheet data table
        const headers: string[] = this.setHeader(worksheet, data, options);

        // Set the data rows
        this.setDataRows(data, headers, worksheet);

        if (options?.autoWidth) {
            // Automatically adjust column widths
            this.setAutoWidthColumns(headers, worksheet, data);
        }

        if (options?.formatCells) {
            // Format cells in the worksheet
            this.formatWorksheetCells(worksheet);
        }

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    /**
     * Generate a multi-sheet Excel file
     * @param worksheets - Array of objects containing data and options for each sheet
     * @returns {Promise<Buffer>} - Buffer containing the multi-sheet Excel file
     * @throws {BadRequestException} - If data format is invalid for any sheet
     */
    async exportMultiSheet<T extends Record<string, any>>(
        worksheets: Array<{
            name: string;
            data: T[];
            options?: Omit<IExportDataExcelOptions, 'worksheetName'>;
        }>,
    ): Promise<Buffer> {
        // Validate the data format for each worksheet
        const validateWorksheetData = worksheets.every((sheet) =>
            this.validateExportData(sheet.data),
        );

        if (!validateWorksheetData) {
            throw new InternalServerErrorException(
                'Invalid data format for one or more worksheets',
            );
        }

        const workbook = new exceljs.Workbook();

        for (const sheet of worksheets) {
            const worksheet = workbook.addWorksheet(sheet.name);

            if (sheet.data.length === 0) {
                continue;
            }

            // Set the headers for the worksheet
            const headers: string[] = this.setHeader(
                worksheet,
                sheet.data,
                sheet.options,
            );

            // Set the data rows for the worksheet
            this.setDataRows(sheet.data, headers, worksheet);

            if (sheet.options?.autoWidth) {
                // Automatically adjust column widths
                this.setAutoWidthColumns(headers, worksheet, sheet.data);
            }

            if (sheet.options?.formatCells) {
                // Format cells in the worksheet
                this.formatWorksheetCells(worksheet);
            }
        }

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    /**
     * Validates the data format for export
     * @param data - Data to be validated
     * @returns {boolean} - True if data is valid, false otherwise
     */
    private validateExportData<T extends Record<string, any>>(
        data: T[],
    ): boolean {
        if (!Array.isArray(data)) {
            return false;
        }

        if (data.length === 0) {
            return true;
        }

        return data.every(
            (item) =>
                item !== null && item !== undefined && typeof item === 'object',
        );
    }

    private setHeader(
        worksheet: exceljs.Worksheet,
        data: Record<string, any>[],
        options?: IExportDataExcelOptions,
    ): string[] {
        const headers: string[] = [];
        if (options?.headers) {
            headers.push(...options.headers);
        } else {
            headers.push(...Object.keys(data[0]));
        }

        worksheet.addRow(headers);

        // Set the header row style
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };
        headerRow.eachCell((cell) => {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        return headers;
    }

    private setDataRows(
        data: Record<string, any>[],
        headers: string[],
        worksheet: exceljs.Worksheet,
    ): void {
        data.forEach((item) => {
            const rowData = headers.map((_, idx) => {
                const values = Object.values(item);
                return values[idx] !== undefined ? values[idx] : '';
            });
            worksheet.addRow(rowData);
        });
    }

    private setAutoWidthColumns(
        headers: string[],
        worksheet: exceljs.Worksheet,
        data: Record<string, any>[],
    ): void {
        headers.forEach((header, index) => {
            const column = worksheet.getColumn(index + 1);
            let maxLength = header.length;

            data.forEach((item) => {
                const value = item[header];
                const valueLength = value ? value.toString().length : 0;
                if (valueLength > maxLength) {
                    maxLength = valueLength;
                }
            });

            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });
    }

    private formatWorksheetCells(worksheet: exceljs.Worksheet): void {
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                if (typeof cell.value === 'number') {
                    cell.numFmt = '#,##0.00';
                } else if (typeof cell.value === 'string') {
                    cell.font = { name: 'Arial', size: 12 };
                }
            });
        });
    }
}
