import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ExamStatus, UserRole } from 'src/utils/enum';
import { GetFacultyExamsResponse } from './get-faculty-exams.response';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('faculty/exams')
export class GetFacultyExamsController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Get('my-exams')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getFacultyExams(
        @Query('facultyId') facultyId: string,
        @Query('status') status?: ExamStatus
    ): Promise<GetFacultyExamsResponse> {
        const exams = await this.facultyService.getFacultyExams(facultyId, status);

        return {
            success: true,
            message: exams.length > 0 ? 'Exams fetched successfully' : 'No exams found',
            data: exams
        };
    }
}
