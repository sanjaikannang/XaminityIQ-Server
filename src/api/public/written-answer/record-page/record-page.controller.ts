import { Controller, Post, Body } from '@nestjs/common';
import { PublicWrittenAnswerService } from 'src/services/public-service/written-answer.service';
import { RecordPageRequest } from './record-page.request';
import { RecordPageResponse } from './record-page.response';

@Controller('public/written-answer')
export class RecordPageController {
    constructor(private readonly publicWrittenAnswerService: PublicWrittenAnswerService) { }

    @Post('page')
    async recordPage(@Body() data: RecordPageRequest): Promise<RecordPageResponse> {
        const result = await this.publicWrittenAnswerService.recordPageAPI(data.token, data.pageNumber, data.cloudinaryUrl);

        return {
            success: true,
            message: 'Page uploaded successfully',
            ...result,
        };
    }
}
