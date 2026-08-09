import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { GetExamResponse } from './get-exam.response';

@Controller('admin')
export class GetExamController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Get('exams/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getExam(@Param('id') id: string): Promise<GetExamResponse> {
        const exam = await this.examManagementService.getExamByIdAPI(id);

        return {
            success: true,
            message: 'Exam fetched successfully',
            data: exam,
        };
    }
}
