import { Controller, Post, Body } from '@nestjs/common';
import { PublicWrittenAnswerService } from 'src/services/public-service/written-answer.service';
import { GetUploadSignatureRequest } from './get-upload-signature.request';
import { GetUploadSignatureResponse } from './get-upload-signature.response';

@Controller('public/written-answer')
export class GetUploadSignatureController {
    constructor(private readonly publicWrittenAnswerService: PublicWrittenAnswerService) { }

    @Post('signature')
    async getUploadSignature(@Body() data: GetUploadSignatureRequest): Promise<GetUploadSignatureResponse> {
        const result = await this.publicWrittenAnswerService.getUploadSignatureAPI(data.token, data.pageNumber);

        return {
            success: true,
            message: 'Upload signature generated successfully',
            data: result,
        };
    }
}
