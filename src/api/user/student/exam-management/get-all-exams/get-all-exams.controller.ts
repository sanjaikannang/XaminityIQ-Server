import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { GetAllExamsResponse } from './get-all-exams.response';

@Controller('student')
export class GetAllExamsController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Get('exams')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getAllExams(@Req() req: Request): Promise<GetAllExamsResponse> {
        const userId = (req as any).user?.sub;
        const exams = await this.examAttemptService.getMyExamsAPI(userId);

        return {
            success: true,
            message: 'Exams fetched successfully',
            data: exams,
        };
    }
}
