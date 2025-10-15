export class FileUtil {
    /**
     * @type {string[]}
     * @public
     * @description
     * This list is used to validate if a file is an image based on its MIME type
     * and can be extended to include more image types as needed.
     * It is important to ensure that the MIME types are accurate and cover the
     * most common image formats to avoid issues with file uploads and processing.
     */
    static imageMimeTypes: string[] = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
    ];

    /**
     * @type {string[]}
     * @public
     * @description
     * This list is used to validate if a file is a video based on its MIME type
     * and can be extended to include more video types as needed.
     */
    static videoMimeTypes: string[] = [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mpeg',
    ];

    /**
     * @type {string[]}
     * @public
     * @description
     * This list is used to validate if a file is an audio based on its MIME type
     * and can be extended to include more audio types as needed.
     * It is important to ensure that the MIME types are accurate and cover the
     * most common audio formats to avoid issues with file uploads and processing.
     */
    static audioMimeTypes: string[] = [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/flac',
    ];

    /**
     * @type {string[]}
     * @public
     * @description
     * This list is used to validate if a file is a document based on its MIME type.
     * It can be extended to include more document types as needed.
     */
    static documentMimeTypes: string[] = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    /**
     * @type {string[]}
     * @public
     * @description
     * This list is used to validate if a file is a text file based on its MIME type.
     * It can be extended to include more text file types as needed.
     */
    static textMimeTypes: string[] = [
        'text/plain',
        'text/csv',
        'text/markdown',
    ];

    /**
     * @type {string[]}
     * @public
     * @description
     * This list is used to validate if a file is a valid type (image, video, audio, or document)
     * based on its MIME type. It combines all the individual MIME type arrays
     * to provide a comprehensive list of valid file types.
     * It is important to ensure that the MIME types are accurate and cover the
     * most common file formats to avoid issues with file uploads and processing.
     * This list can be extended to include more file types as needed.
     * It is used to validate if a file is a valid type (image, video, audio, or document)
     * based on its MIME type.
     * @returns {string[]} An array of valid MIME types for images, videos, audios, and documents.
     */
    static validFileMimeTypes: string[] = [
        ...this.imageMimeTypes,
        ...this.videoMimeTypes,
        ...this.audioMimeTypes,
        ...this.documentMimeTypes,
        ...this.textMimeTypes,
    ];

    /**
     * @description
     * This list is used to list all valid units for file sizes.
     */
    static fileSizeUnits: string[] = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    /**
     * Generates a unique filename based on the current timestamp and original file extension.
     * @param originalName - The original name of the file.
     * @returns A unique filename with the original file extension.
     */
    static generateUniqueFilename(originalName: string): string {
        const timestamp = Date.now();
        const [fileName, fileExtension] = originalName.split('.').slice(-2);

        return `${fileName}-${timestamp}.${fileExtension}`;
    }

    /**
     * Validates if the provided file is an image based on its MIME type.
     * @param mimeType - The MIME type of the file.
     * @returns True if the file is an image, false otherwise.
     */
    static isImage(mimeType: string): boolean {
        return this.imageMimeTypes.includes(mimeType);
    }

    /**
     * Validates if the provided file is a video based on its MIME type.
     * @param mimeType - The MIME type of the file.
     * @returns True if the file is a video, false otherwise.
     */
    static isVideo(mimeType: string): boolean {
        return this.videoMimeTypes.includes(mimeType);
    }

    /**
     * Validates if the provided file is an audio based on its MIME type.
     * @param mimeType - The MIME type of the file.
     * @returns True if the file is an audio, false otherwise.
     */
    static isAudio(mimeType: string): boolean {
        return this.audioMimeTypes.includes(mimeType);
    }

    /**
     * Validates if the provided file is a document based on its MIME type.
     * @param mimeType - The MIME type of the file.
     * @returns True if the file is a document, false otherwise.
     */
    static isDocument(mimeType: string): boolean {
        return this.documentMimeTypes.includes(mimeType);
    }

    /**
     *
     * Validates if the provided file is a text file based on its MIME type.
     * @param mimeType - The MIME type of the file.
     * @returns True if the file is a text file, false otherwise.
     */
    static isText(mimeType: string): boolean {
        return this.textMimeTypes.includes(mimeType);
    }

    /**
     * Validates if the provided file is a valid type (image, video, audio, or document).
     * @param mimeType - The MIME type of the file.
     * @returns True if the file is a valid type, false otherwise.
     */
    static isValidFileType(mimeType: string): boolean {
        return (
            this.isImage(mimeType) ||
            this.isVideo(mimeType) ||
            this.isAudio(mimeType) ||
            this.isDocument(mimeType) ||
            this.isText(mimeType)
        );
    }

    /**
     * Convert a file size from bytes to a human-readable format.
     * @param size - The size of the file in bytes.
     * @returns A string representing the file size in a human-readable format (e.g., "2 MB", "500 KB").
     * This function formats the size to the nearest unit (bytes, KB, MB, GB, etc.) for better readability.
     */
    static formatFileSizeBytes(sizeInBytes: number): string {
        if (sizeInBytes < 1024)
            return `${sizeInBytes} ${this.fileSizeUnits[0]}`;

        let size = sizeInBytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < this.fileSizeUnits.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${this.fileSizeUnits[unitIndex]}`;
    }
}
