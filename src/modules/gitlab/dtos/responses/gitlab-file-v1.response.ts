export interface IGitlabFile {
    file_name: string;
    file_path: string;
    size: number;
    encoding: string;
    content_sha256: string;
    ref: string;
    content: string;
}

export class GitlabFileV1Response {
    fileName: string;
    filePath: string;
    size: number;
    encoding: string;
    contentSha256: string;
    ref: string;
    content: string;

    static FromEntity(data: IGitlabFile): GitlabFileV1Response {
        return {
            fileName: data.file_name,
            filePath: data.file_path,
            size: data.size,
            encoding: data.encoding,
            contentSha256: data.content_sha256,
            ref: data.ref,
            content: data.content,
        };
    }
}
