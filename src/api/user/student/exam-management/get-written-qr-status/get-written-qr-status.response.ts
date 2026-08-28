export class WrittenAnswerPageData {
    pageNumber: number;
    cloudinaryUrl: string;
    uploadedAt: Date;
}

export class WrittenQrStatusData {
    pageCount: number;
    pages: WrittenAnswerPageData[];
    qrScannedAt?: Date;
    isFinalized: boolean;
    qrTokenExpiresAt?: Date;
}

export class GetWrittenQrStatusResponse {
    success: boolean;
    message: string;
    data?: WrittenQrStatusData;
}
