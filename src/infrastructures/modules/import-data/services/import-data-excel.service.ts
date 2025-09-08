import { BadRequestException } from '@nestjs/common';
import * as exceljs from 'exceljs';
import { IImportDataExcelService } from '../interfaces/import-data-service.interface';
import { IImportDataExcelOptions } from '../interfaces/options/import-data-excel-options.interface';
import { IValidateImportDataExcelOptions } from '../interfaces/options/validate-import-data-excel-options.interface';

/**
 * Service for importing data from Excel format.
 * This service implements the IImportDataExcelService interface
 * and provides methods to import data from single or multi-sheet Excel files.
 * It uses the exceljs library to handle Excel file reading and parsing.
 * @implements {IImportDataExcelService}
 * @class ImportDataExcelService
 */
export class ImportDataExcelService<TData extends Record<string, any> = any>
    implements IImportDataExcelService<TData>
{
    private readonly DEFAULT_HEADER_ROW = 1; // First row considered default header row

    /**
     * Imports data from a single-sheet Excel file.
     * @param fileBuffer - Buffer containing the Excel file.
     * @param options - Options for Excel import.
     * @returns {Promise<Record<string, any>[]>} - Array of objects containing the imported data.
     * @throws {InternalServerErrorException} - If the file is invalid or parsing fails.
     */
    async import(
        fileBuffer: Buffer,
        options: IImportDataExcelOptions,
    ): Promise<TData[]> {
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(fileBuffer as unknown as exceljs.Buffer);

        const headerRowIndex = options?.headerRow || this.DEFAULT_HEADER_ROW;
        const columnMapping = options.columnMapping;

        await this.validateTemplate(fileBuffer, {
            templatePath: options.validateTemplate,
            validateAllSheet: false,
            sheetName: options.sheetName,
            headerRow: headerRowIndex,
        });

        if (options?.sheetName) {
            const worksheet = workbook.getWorksheet(options.sheetName);
            if (!worksheet) {
                throw new BadRequestException(
                    `Worksheet with name '${options.sheetName}' not found in the Excel file.`,
                );
            }
            return await this.importSheet(
                worksheet,
                headerRowIndex,
                columnMapping,
            );
        } else {
            const worksheet = workbook.worksheets[0];
            return await this.importSheet(
                worksheet,
                headerRowIndex,
                columnMapping,
            );
        }
    }

    async importMultiSheet(
        fileBuffer: Buffer,
        options: IImportDataExcelOptions,
    ): Promise<TData[]> {
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(fileBuffer as unknown as exceljs.Buffer);

        const headerRowIndex = options?.headerRow || this.DEFAULT_HEADER_ROW;
        const columnMapping = options.columnMapping;

        await this.validateTemplate(fileBuffer, {
            templatePath: options.validateTemplate,
            validateAllSheet: true,
            headerRow: headerRowIndex,
        });

        const importedData: Record<string, any>[] = [];
        for (const worksheet of workbook.worksheets) {
            const sheetData = await this.importSheet(
                worksheet,
                headerRowIndex,
                columnMapping,
            );
            importedData.push(...sheetData);
        }
        return importedData as TData[];
    }

    private async importSheet(
        worksheet: exceljs.Worksheet,
        headerRowIndex: number,
        columnMapping: Record<string, string>,
    ): Promise<TData[]> {
        const importedData: TData[] = [];
        const header: string[] = [];
        worksheet.getRow(headerRowIndex).eachCell((cell, colNumber) => {
            header.push(
                cell.value ? String(cell.value) : `Column ${colNumber}`,
            );
        });
        for (let i = headerRowIndex + 1; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            const rowData: Record<string, any> = {};
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const headerKey = header[colNumber - 1];
                if (headerKey) {
                    const mappedKey =
                        Object.keys(columnMapping).find(
                            (k) => columnMapping[k] === headerKey,
                        ) || headerKey;
                    let value = cell.value;
                    if (value && typeof value === 'object' && 'text' in value) {
                        value = value.text;
                    }
                    rowData[mappedKey] = value;
                }
            });
            if (Object.keys(rowData).length > 0) {
                importedData.push(rowData as TData);
            }
        }
        return importedData;
    }

    async validateTemplate(
        buffer: Buffer,
        options: IValidateImportDataExcelOptions,
    ): Promise<void> {
        const templateWorkbook = new exceljs.Workbook();
        await templateWorkbook.xlsx.readFile(options.templatePath);
        const templateWorksheet = templateWorkbook.worksheets[0];
        const templateHeaderRow = templateWorksheet.getRow(options.headerRow);
        const templateHeaders = Array.isArray(templateHeaderRow.values)
            ? templateHeaderRow.values
                  .slice(1)
                  .map((v) => (typeof v === 'string' ? v.trim() : ''))
            : [];

        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(buffer as unknown as exceljs.Buffer);

        if (options.validateAllSheet) {
            // Validate all sheet
            for (const worksheet of workbook.worksheets) {
                const headerRow = worksheet.getRow(options.headerRow);
                const headers = Array.isArray(headerRow.values)
                    ? headerRow.values
                          .slice(1)
                          .map((v) => (typeof v === 'string' ? v.trim() : ''))
                    : [];

                if (
                    headers.length !== templateHeaders.length ||
                    !headers.every((h, i) => h === templateHeaders[i])
                ) {
                    throw new BadRequestException(
                        `Invalid template header in sheet \'${worksheet.name}\'. Expected: ${templateHeaders.join(', ')}`,
                    );
                }
            }
        } else if (options.sheetName) {
            // Validate single sheet
            const worksheet = workbook.getWorksheet(options.sheetName);
            if (!worksheet) {
                throw new BadRequestException(
                    `Sheet \'${options.sheetName}\' not found`,
                );
            }

            const headerRow = worksheet.getRow(options.headerRow);
            const headers = Array.isArray(headerRow.values)
                ? headerRow.values
                      .slice(1)
                      .map((v) => (typeof v === 'string' ? v.trim() : ''))
                : [];

            if (
                headers.length !== templateHeaders.length ||
                !headers.every((h, i) => h === templateHeaders[i])
            ) {
                throw new BadRequestException(
                    `Invalid template header in sheet \'${options.sheetName}\'. Expected: ${templateHeaders.join(', ')}`,
                );
            }
        } else {
            // Default: validate first sheet
            const worksheet = workbook.worksheets[0];
            const headerRow = worksheet.getRow(options.headerRow);
            const headers = Array.isArray(headerRow.values)
                ? headerRow.values
                      .slice(1)
                      .map((v) => (typeof v === 'string' ? v.trim() : ''))
                : [];

            if (
                headers.length !== templateHeaders.length ||
                !headers.every((h, i) => h === templateHeaders[i])
            ) {
                throw new BadRequestException(
                    `Invalid template header. Expected: ${templateHeaders.join(', ')}`,
                );
            }
        }
    }
}
