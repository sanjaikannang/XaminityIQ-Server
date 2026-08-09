export class VerifyQrTokenData {
    questionText: string;
    marks: number;
    existingPageCount: number;
}

export class VerifyQrTokenResponse {
    success: boolean;
    message: string;
    data?: VerifyQrTokenData;
}
