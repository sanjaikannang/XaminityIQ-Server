import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoinExamRoomResponse } from './join-exam-room.response';
import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { StudentService } from 'src/services/user-service/student/student.service';

@Controller('student')
export class JoinExamRoomController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Post('exam/request/:requestId/join-room')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async joinRoom(
        @Req() req: any,
        @Param('requestId') requestId: string
    ): Promise<JoinExamRoomResponse> {
        const studentId = req.user.sub;

        const result = await this.studentService.joinExamRoom(
            requestId,
            studentId
        );

        return {
            success: true,
            message: 'Joined exam room successfully',
            data: result,
        };
    }
}
