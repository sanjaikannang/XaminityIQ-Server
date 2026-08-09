import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { GetExamAttemptsResponse } from './get-exam-attempts.response';

@Controller('admin')
export class GetExamAttemptsController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Get('exams/:id/attempts')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getExamAttempts(@Param('id') id: string): Promise<GetExamAttemptsResponse> {
        const attempts = await this.examManagementService.getExamAttemptsAPI(id);

        return {
            success: true,
            message: 'Exam attempts fetched successfully',
            data: { attempts },
        };
    }
}
