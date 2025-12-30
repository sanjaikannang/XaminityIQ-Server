import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateExamRequest } from './create-exam.request';
import { CreateExamResponse } from './create-exam.response';
import { Controller, Post, Body, UseGuards, } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';

@Controller('admin')
export class CreateExamController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Post('exams')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createExam(
        @Body() createExamData: CreateExamRequest,
    ) {
        await this.examManagementService.createExamAPI(createExamData);

        const response: CreateExamResponse = {
            success: true,
            message: 'Exam Created Successfully'
        };

        return response;
    }
}