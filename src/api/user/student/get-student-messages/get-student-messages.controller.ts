import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/utils/enum';
import { StudentService } from 'src/services/user-service/student/student.service';

@Controller('student/exams')
export class GetStudentMessagesController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Get(':examId/messages/my-messages')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getStudentMessages(
        @Param('examId') examId: string,
        @Query('studentId') studentId: string
    ) {
        const messages = await this.studentService.getStudentMessages(examId, studentId);

        return {
            success: true,
            message: 'Messages fetched successfully',
            data: messages
        };
    }
}