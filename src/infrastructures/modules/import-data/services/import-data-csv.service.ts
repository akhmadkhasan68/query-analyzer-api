import { BadRequestException } from '@nestjs/common';
import { IImportDataCsvService } from '../interfaces/import-data-service.interface';
import { IImportDataCsvOptions } from '../interfaces/options/import-data-csv-options.interface';
import * as fs from 'node:fs';
import { IValidateImportDataCsvOptions } from '../interfaces/options/validate-import-data-csv-options.interface';
import { ERROR_MESSAGE_CONSTANT } from '../../../../shared/constants/error-message.constant';

/**
 * Service for importing data from CSV format
 * This service implements the IImportDataCsvService interface
 * and provides methods to import data from CSV files.
 * It parses CSV content and maps it to the specified data structure.
 * @implements {IImportDataCsvService}
 * @class ImportDataCsvService
 */
export class ImportDataCsvService implements IImportDataCsvService {
    private readonly DEFAULT_HEADER_ROW = 0;
    private readonly DEFAULT_DELIMITER = ';';

    /**
     * Imports data from a CSV file buffer.
     * @param fileBuffer - The buffer containing the CSV file content.
     * @param options - Options for importing data, including header row and delimiter.
     * @returns A promise that resolves to an array of parsed data objects.
     */
    async import<TData extends Record<string, any>>(
        fileBuffer: Buffer,
        options: IImportDataCsvOptions,
    ): Promise<TData[]> {
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new BadRequestException(ERROR_MESSAGE_CONSTANT.FileNotFound);
        }

        const headerRowIndex = options?.headerRow || this.DEFAULT_HEADER_ROW;
        const delimiter = options.delimiter ?? this.DEFAULT_DELIMITER;

        if (options?.validateTemplate) {
            await this.validateTemplate(fileBuffer, {
                templatePath: options.validateTemplate,
                delimiter: delimiter,
                headerRow: headerRowIndex,
            });
        }

        const csvContent = this.removeBOM(fileBuffer.toString('utf8'));
        const rows = csvContent.split('\n').filter((row) => row.trim() !== '');

        if (rows.length <= headerRowIndex) {
            throw new BadRequestException(
                ERROR_MESSAGE_CONSTANT.CsvImportInsufficientRows,
            );
        }

        const headers = this.parseHeaders(
            rows[headerRowIndex],
            delimiter,
            options.columnMapping,
        );
        const dataRows = rows.slice(headerRowIndex + 1);

        const result: TData[] = [];
        dataRows.forEach((row) => {
            const parsedRow = this.parseRow(row, headers, delimiter);
            if (parsedRow) {
                result.push(parsedRow as TData);
            }
        });

        return result;
    }

    /**
     * Validates the CSV template against the provided file buffer.
     * @param file - The buffer containing the CSV file content.
     * @param options - Options for validation, including template path, delimiter, and header row.
     * @throws {BadRequestException} If the CSV file does not match the template.
     */
    async validateTemplate(
        file: Buffer,
        options: IValidateImportDataCsvOptions,
    ): Promise<void> {
        const csvContent = this.removeBOM(file.toString('utf8'));
        const csvRows = csvContent
            .split('\n')
            .filter((row) => row.trim() !== '');

        if (csvRows.length <= options.headerRow) {
            throw new BadRequestException(
                ERROR_MESSAGE_CONSTANT.CsvImportInsufficientRows,
            );
        }

        const actualHeaders = this.extractHeaders(
            csvRows[options.headerRow],
            options.delimiter || ';',
        );
        this.validateHeaders(
            actualHeaders,
            ERROR_MESSAGE_CONSTANT.CsvImportNoHeaders,
        );

        const templateContent = this.readTemplateFile(options.templatePath);
        const templateLines = templateContent
            .split('\n')
            .filter((row) => row.trim() !== '');

        if (templateLines.length <= options.headerRow) {
            throw new BadRequestException(
                ERROR_MESSAGE_CONSTANT.CsvImportInsufficientRows,
            );
        }

        const expectedHeaders = this.extractHeaders(
            templateLines[options.headerRow],
            options.delimiter || ';',
        );
        this.validateHeaders(
            expectedHeaders,
            ERROR_MESSAGE_CONSTANT.CsvImportNoHeaders,
        );

        this.compareHeaders(actualHeaders, expectedHeaders);
    }

    /**
     * Removes the Byte Order Mark (BOM) from the beginning of a string.
     * @param content - The string content to process.
     * @returns The content without the BOM.
     */
    private removeBOM(content: string): string {
        return content.startsWith('\ufeff') ? content.slice(1) : content;
    }

    /**
     * Extracts headers from a header row string using the specified delimiter.
     * @param headerRow - The header row string.
     * @param delimiter - The delimiter used to separate headers.
     * @returns An array of header strings.
     */
    private extractHeaders(headerRow: string, delimiter: string): string[] {
        return headerRow
            .split(delimiter)
            .map((header) => header.trim().replace(/"/g, ''));
    }

    /**
     * Validates that the headers array is not empty and throws an error if it is.
     * @param headers - The array of headers to validate.
     * @param errorMessage - The error message to throw if validation fails.
     * @throws {BadRequestException} If the headers array is empty or contains only an empty string.
     */
    private validateHeaders(headers: string[], errorMessage: string): void {
        if (
            headers.length === 0 ||
            (headers.length === 1 && headers[0] === '')
        ) {
            throw new BadRequestException(errorMessage);
        }
    }

    /**
     * Reads the template file from the specified path and returns its content.
     * @param templatePath - The path to the template file.
     * @returns The content of the template file as a string.
     * @throws {BadRequestException} If the template file cannot be read.
     */
    private readTemplateFile(templatePath: string): string {
        try {
            const content = fs.readFileSync(templatePath, 'utf8');
            return this.removeBOM(content);
        } catch {
            throw new BadRequestException(
                ERROR_MESSAGE_CONSTANT.CsvImportTemplateReadFailed,
            );
        }
    }

    /**
     * Compares the actual headers from the CSV file with the expected headers from the template.
     * Throws an error if any expected headers are missing.
     * @param actualHeaders - The headers extracted from the CSV file.
     * @param expectedHeaders - The headers defined in the template.
     * @throws {BadRequestException} If any expected headers are missing in the actual headers.
     */
    private compareHeaders(
        actualHeaders: string[],
        expectedHeaders: string[],
    ): void {
        const lowercasedActual = actualHeaders.map((h) => h.toLowerCase());
        const missingHeaders = expectedHeaders.filter(
            (expectedHeader) =>
                !lowercasedActual.includes(expectedHeader.toLowerCase()),
        );

        if (missingHeaders.length > 0) {
            throw new BadRequestException(
                `${ERROR_MESSAGE_CONSTANT.CsvImportMissingHeaders}: ${missingHeaders.join(', ')}`,
            );
        }
    }

    /**
     * Parses the header row and maps it to an array of header objects.
     * @param headerRow - The header row string.
     * @param delimiter - The delimiter used to separate headers.
     * @param columnMapping - A mapping of header titles to IDs.
     * @returns An array of header objects with id and title properties.
     */
    private parseHeaders(
        headerRow: string,
        delimiter: string,
        columnMapping: Record<string, string>,
    ): Array<{ id: string; title: string }> {
        const headerTitleToIdMap = Object.entries(columnMapping).reduce(
            (acc, [key, value]) => {
                acc[value] = key;
                return acc;
            },
            {} as Record<string, string>,
        );

        const headers = this.extractHeaders(headerRow, delimiter);
        return headers.map((header, index) => ({
            id: headerTitleToIdMap[header] || `column_${index}`,
            title: header,
        }));
    }

    /**
     * Parses a single row of CSV data and maps it to an object using the provided headers.
     * @param row - The CSV row string to parse.
     * @param headers - An array of header objects containing id and title.
     * @param delimiter - The delimiter used to separate values in the row.
     * @returns A record object mapping header IDs to their corresponding values, or null if parsing fails.
     */
    private parseRow(
        row: string,
        headers: Array<{ id: string; title: string }>,
        delimiter: string,
    ): Record<string, any> | null {
        const values = this.extractHeaders(row, delimiter);
        if (values.length < headers.length) {
            return null;
        }

        const result: Record<string, any> = {};
        headers.forEach((header, index) => {
            result[header.id] = values[index] || '';
        });
        return result;
    }
}
