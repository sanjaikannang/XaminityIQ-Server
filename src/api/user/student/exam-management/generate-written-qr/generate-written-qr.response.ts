export class GenerateWrittenQrData {
    token: string;
    expiresAt: Date;
}

export class GenerateWrittenQrResponse {
    success: boolean;
    message: string;
    data?: GenerateWrittenQrData;
}
