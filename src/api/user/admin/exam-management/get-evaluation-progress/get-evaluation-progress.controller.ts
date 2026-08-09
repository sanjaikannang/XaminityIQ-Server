import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { GetEvaluationProgressResponse } from './get-evaluation-progress.response';

@Controller('admin')
export class GetEvaluationProgressController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Get('exams/:id/evaluation-progress')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getEvaluationProgress(@Param('id') id: string): Promise<GetEvaluationProgressResponse> {
        const data = await this.examManagementService.getEvaluationProgressAPI(id);

        return {
            success: true,
            message: 'Evaluation progress fetched successfully',
            data,
        };
    }
}
