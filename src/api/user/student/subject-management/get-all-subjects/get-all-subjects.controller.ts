import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StudentService } from 'src/services/user-service/student/student.service';
import { GetAllSubjectsResponse } from './get-all-subjects.response';

@Controller('student')
export class GetAllSubjectsController {
    constructor(private readonly studentService: StudentService) { }

    @Get('subjects')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getAllSubjects(@Req() req: Request): Promise<GetAllSubjectsResponse> {
        const userId = (req as any).user?.sub;
        const subjects = await this.studentService.getMySubjectsAPI(userId);

        return {
            success: true,
            message: 'Subjects fetched successfully',
            data: subjects,
        };
    }
}
