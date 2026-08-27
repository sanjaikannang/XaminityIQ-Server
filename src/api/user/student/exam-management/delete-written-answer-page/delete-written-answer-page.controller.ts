import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Delete, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { DeleteWrittenAnswerPageResponse } from './delete-written-answer-page.response';

@Controller('student')
export class DeleteWrittenAnswerPageController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Delete('exams/attempts/:attemptId/answers/:questionId/pages/:pageNumber')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async deleteWrittenAnswerPage(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Param('questionId') questionId: string,
        @Param('pageNumber', ParseIntPipe) pageNumber: number,
    ): Promise<DeleteWrittenAnswerPageResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.examAttemptService.deleteWrittenAnswerPageAPI(userId, attemptId, questionId, pageNumber);

        return {
            success: true,
            message: 'Page deleted successfully',
            pageCount: result.pageCount,
        };
    }
}
