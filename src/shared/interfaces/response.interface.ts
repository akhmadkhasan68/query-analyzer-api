interface IDataUnprocessable {
    property: string;
    message: string[];
}

export interface IUnprocessableResponse {
    message: string;
    data: Array<IDataUnprocessable>;
}
export interface IErrorResponse {
    message: string;
    error?: string | null;
    errors?: string[] | [] | object | null;
}

export interface IFileUploadResponse {
    fileUrl: string;
    fileName: string;
    filePath: string;
    fileMimeType: string;
}
