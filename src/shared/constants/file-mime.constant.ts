export const FileMimeConstant = {
    Jpeg: 'image/jpeg',
    Png: 'image/png',
    Jpg: 'image/jpg',
    Pdf: 'application/pdf',
    Zip: 'application/zip',
    Xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    Xls: 'application/vnd.ms-excel',
    Csv: 'text/csv',
} as const;

export type TFileMimeType =
    (typeof FileMimeConstant)[keyof typeof FileMimeConstant];
