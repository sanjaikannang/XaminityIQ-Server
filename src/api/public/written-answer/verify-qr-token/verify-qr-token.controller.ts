import { Controller, Post, Body } from '@nestjs/common';
import { PublicWrittenAnswerService } from 'src/services/public-service/written-answer.service';
import { VerifyQrTokenRequest } from './verify-qr-token.request';
import { VerifyQrTokenResponse } from './verify-qr-token.response';

// Unauthenticated by design — the QR token itself is the credential, scanned
// from a phone that isn't logged into the main app.
@Controller('public/written-answer')
export class VerifyQrTokenController {
    constructor(private readonly publicWrittenAnswerService: PublicWrittenAnswerService) { }

    @Post('verify')
    async verifyQrToken(@Body() data: VerifyQrTokenRequest): Promise<VerifyQrTokenResponse> {
        const result = await this.publicWrittenAnswerService.verifyTokenAPI(data.token);

        return {
            success: true,
            message: 'QR code verified successfully',
            data: result,
        };
    }
}
