import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetFacultyExamsRequest } from './get-faculty-exams.request';
import { GetFacultyExamsResponse } from './get-faculty-exams.response';
import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
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
        @Request() req: any,
        @Query() query: GetFacultyExamsRequest
    ): Promise<GetFacultyExamsResponse> {
        const facultyId = req.user.sub;
        const exams = await this.facultyService.getFacultyExams(
            facultyId,
            query.status
        );

        return {
            success: true,
            message: exams.length > 0 ? 'Exams fetched successfully' : 'No exams found',
            data: exams
        };
    }
}