import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { GetMyEvaluationExamsResponse } from './get-my-evaluation-exams.response';

@Controller('faculty')
export class GetMyEvaluationExamsController {
    constructor(private readonly facultyService: FacultyService) { }

    @Get('evaluation/exams')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getMyEvaluationExams(@Req() req: Request): Promise<GetMyEvaluationExamsResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.facultyService.getMyEvaluationExamsAPI(userId);

        return {
            success: true,
            message: 'Evaluation exams fetched successfully',
            data,
        };
    }
}
