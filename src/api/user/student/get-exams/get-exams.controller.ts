import { UserRole } from "src/utils/enum";
import { RoleGuard } from "src/guards/role.guard";
import { Roles } from "src/decorators/roles.decorator";
import { GetExamsResponse } from "./get-exams.response";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { StudentService } from "src/services/user-service/student/student.service";

@Controller('student')
export class GetExamsController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Get('exams')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getExams(
        @Req() req: any
    ): Promise<GetExamsResponse> {
        const studentId = req.user.userId; // Extract from JWT token

        const exams = await this.studentService.getExams(studentId);

        return {
            message: "exams fetched data successfully",
            success: true,
            data: exams,
        };
    }
}