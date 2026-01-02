import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { GetExamsResponse } from './get-exams.response';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('faculty')
export class GetExamsController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Get('exams')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getExams(
        @Req() req: any
    ): Promise<GetExamsResponse> {
        const facultyId = req.user.userId; // Extract from JWT token

        const exams = await this.facultyService.getExams(facultyId);

        return {
            message: "Exams Fetched Successfully",
            success: true,
            data: exams,
        };
    }
}