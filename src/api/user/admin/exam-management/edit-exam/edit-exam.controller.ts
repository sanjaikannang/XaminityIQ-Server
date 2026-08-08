import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { EditExamRequest } from './edit-exam.request';
import { EditExamResponse } from './edit-exam.response';

@Controller('admin')
export class EditExamController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Patch('exams/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async editExam(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() data: EditExamRequest,
    ): Promise<EditExamResponse> {
        const userId = (req as any).user?.sub;
        await this.examManagementService.editExamAPI(id, data, userId);

        return {
            success: true,
            message: 'Exam updated successfully',
        };
    }
}
