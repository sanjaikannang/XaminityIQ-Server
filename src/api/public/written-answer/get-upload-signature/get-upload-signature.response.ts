export class UploadSignatureData {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    publicId: string;
    folder: string;
}

export class GetUploadSignatureResponse {
    success: boolean;
    message: string;
    data?: UploadSignatureData;
}
