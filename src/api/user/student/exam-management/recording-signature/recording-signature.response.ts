export class RecordingSignatureData {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    publicId: string;
    folder: string;
}

export class RecordingSignatureResponse {
    success: boolean;
    message: string;
    data?: RecordingSignatureData;
}
