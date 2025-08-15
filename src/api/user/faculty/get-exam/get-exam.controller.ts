import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RoleGuard } from "src/guards/role.guard";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "src/utils/enum";
import { GetExamResponse } from "./get-exam.response";
import { FacultyService } from "src/services/user-service/faculty/faculty.service";


@Controller('faculty')
export class GetExamController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Get('get-exam')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getExam(
        @Req() req: Request
    ) {
        try {
            const facultyId = (req as any).user?.sub;

            console.log("Faculty ID from request:", facultyId);

            const result = await this.facultyService.getFacultyExamAPI(facultyId);

            const response: GetExamResponse = {
                success: true,
                message: 'Exam retrieved successfully',
                data: result,
            };

            return response;

        } catch (error) {
            const response: GetExamResponse = {
                success: false,
                message: error.message || 'Failed to get exam',
            };
            return response;
        }
    }
}