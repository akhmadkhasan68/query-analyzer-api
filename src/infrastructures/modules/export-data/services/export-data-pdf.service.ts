import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import * as path from 'path';
import { finished } from 'stream/promises';
import * as wkhtmltopdf from 'wkhtmltopdf';
import { IExportDataPdfService } from '../interfaces/export-data-service.interface';
import { IExportDataPdfOptions } from '../interfaces/options/export-data-pdf-options.interface';

/**
 * Service for exporting HTML to PDF format
 *
 * This service implements the IExportDataService interface and provides methods
 * to export HTML content to PDF using wkhtmltopdf. It converts HTML content to
 * PDF buffer without any storage or template management.
 *
 * @requires wkhtmltopdf - Binary must be installed on system
 * @see https://wkhtmltopdf.org/downloads.html for installation instructions
 *
 * Installation:
 * - Linux: sudo apt-get install wkhtmltopdf
 * - MacOS: brew install wkhtmltopdf
 * - Windows: Download from https://wkhtmltopdf.org/downloads.html
 * @implements {IExportDataService}
 * @class ExportDataPdfService
 */
export class ExportDataPdfService implements IExportDataPdfService {
    /**
     * Export HTML to PDF format
     * @param data - HTML string or array of HTML strings to be converted to PDF
     * @param options - PDF export options (optional), Reference for options: https://wkhtmltopdf.org/usage/wkhtmltopdf.txt
     * @returns {Promise<Buffer>} - Buffer containing the PDF file
     * @throws {InternalServerErrorException} - If PDF generation fails
     */
    async export(
        data: Record<string, string>,
        options: IExportDataPdfOptions,
    ): Promise<Buffer> {
        let templatePath: string;
        if (options.isCustomTemplate) {
            templatePath = options.template; // Custom template path
        } else {
            templatePath = path.join(
                __dirname,
                `../templates/pdf/${options.template}.hbs`,
            ); // Template path
        }

        const rawTemplate = await fs.readFile(templatePath, 'utf-8');
        const compiled = handlebars.compile(rawTemplate);
        const htmlContent = compiled(data);

        // Generate PDF using wkhtmltopdf
        const stream = wkhtmltopdf(htmlContent, options.options);
        const chunks: Buffer[] = [];

        stream.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        await finished(stream);

        return Buffer.concat(chunks);
    }
}
