import { config } from 'src/config';
import { FileUtil } from '../utils/file.util';

export const ERROR_MESSAGE_CONSTANT = {
    UnprocessableEntity: 'Unprocessable Entity',
    Unauthorized: 'Not Authorized',
    ForbiddenAccess: 'Forbidden Access',
    NotFound: 'Not Found',
    InternalServerError: 'Internal Server Error',
    BadRequest: 'Bad Request',
    Conflict: 'Conflict',
    ValidationError: 'Validation Error',
    FieldRequired: 'Field Required',
    FieldRequiredWithName: (fieldName: string) =>
        `Field ${fieldName} is required`,
    FieldInvalidValue: 'Field Invalid Value',
    FieldInvalidValueWithName: (fieldName: string, expectedType?: string) =>
        `Field ${fieldName} has an invalid value${expectedType ? `, expected ${expectedType}` : ''}`,
    QueryError: 'Query Error',
    DataNotFound: 'Data Not Found',
    FieldDuplicate: 'Field Duplicate',

    /**
     * Error messages related to file operations
     */
    FileUpload: 'Error Uploading File',
    FileDelete: 'Error Deleting File',
    FileRetrieve: 'Error Retrieving File',
    FileTooLarge: `File size exceeds the maximum limit of ${FileUtil.formatFileSizeBytes(config.storage.fileMaxSizeInBytes)}`,
    InvalidFileMimeType: `Invalid file type. Allowed types: ${FileUtil.validFileMimeTypes.join(', ')}`,
    InvalidSpecificFileMimeType: (allowedTypes: string[]) =>
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    FileNotFound: 'File not found',

    /**
     * Error messages related to csv import
     */
    CsvImportError: 'Error Importing CSV File',
    CsvImportNoHeaders: 'No headers found in CSV file',
    CsvImportTemplateReadFailed: 'Failed to read template file',
    CsvImportInsufficientRows: 'Input CSV file has insufficient rows',
    CsvImportTemplateNoHeaders: 'No headers found in template file',
    CsvImportMissingHeaders: 'Missing required headers in CSV file',
    CsvImportInputInsufficientRows: 'Input CSV file has insufficient rows',
    CsvImportInputNoHeaders: 'No headers found in input CSV file',

    /**
     * Error messages related to user passwords
     */
    PasswordTooWeak:
        'Password too weak, must contain at least 1 number and 1 alphabet',
    PasswordTooShort: (length = 8) =>
        `Password must be at least ${length} characters long`,
    PasswordNotMatch: 'Passwords don\'t match',

    /**
     * Error message related to user phone
     */
    PhoneNumberInvalidFormatID:
        'Should start with 62, followed by 9 to 13 digits (excluding 62)',
} as const;
