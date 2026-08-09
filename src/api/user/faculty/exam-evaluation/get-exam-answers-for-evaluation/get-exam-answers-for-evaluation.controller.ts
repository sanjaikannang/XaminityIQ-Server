import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { GetExamAnswersForEvaluationResponse } from './get-exam-answers-for-evaluation.response';

@Controller('faculty')
export class GetExamAnswersForEvaluationController {
    constructor(private readonly facultyService: FacultyService) { }

    @Get('evaluation/exams/:examId/answers')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getExamAnswersForEvaluation(
        @Req() req: Request,
        @Param('examId') examId: string,
    ): Promise<GetExamAnswersForEvaluationResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.facultyService.getExamAnswersForEvaluationAPI(userId, examId);

        return {
            success: true,
            message: 'Evaluation answers fetched successfully',
            data,
        };
    }
}
