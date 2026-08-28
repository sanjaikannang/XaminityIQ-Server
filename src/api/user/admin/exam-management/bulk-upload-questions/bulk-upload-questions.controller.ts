import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { BulkUploadQuestionsRequest } from './bulk-upload-questions.request';
import { BulkUploadQuestionsResponse } from './bulk-upload-questions.response';

@Controller('admin')
export class BulkUploadQuestionsController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Post('exams/:id/questions/bulk-upload')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async bulkUploadQuestions(
        @Req() req: Request,
        @Param('id') examId: string,
        @Body() data: BulkUploadQuestionsRequest,
    ): Promise<BulkUploadQuestionsResponse> {
        const userId = (req as any).user?.sub;
        const summary = await this.examManagementService.bulkUploadQuestionsAPI(examId, data, userId);

        return {
            success: true,
            message: `Bulk upload completed. ${summary.successCount} question(s) uploaded successfully, ${summary.failedCount} failed.`,
            summary,
        };
    }
}
