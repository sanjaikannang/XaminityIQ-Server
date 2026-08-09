import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { PublishExamResponse } from './publish-exam.response';

@Controller('admin')
export class PublishExamController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Patch('exams/:id/publish')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async publishExam(@Param('id') id: string): Promise<PublishExamResponse> {
        await this.examManagementService.publishExamAPI(id);

        return {
            success: true,
            message: 'Exam published successfully',
        };
    }
}
