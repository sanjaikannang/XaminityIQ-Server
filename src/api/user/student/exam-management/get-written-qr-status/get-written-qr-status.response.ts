export class WrittenQrStatusData {
    pageCount: number;
    qrScannedAt?: Date;
    isFinalized: boolean;
    qrTokenExpiresAt?: Date;
}

export class GetWrittenQrStatusResponse {
    success: boolean;
    message: string;
    data?: WrittenQrStatusData;
}
