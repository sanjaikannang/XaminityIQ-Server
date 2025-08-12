import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { AdminService } from "src/services/user-service/admin/admin.service";
import { RoleGuard } from "src/guards/role.guard";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "src/utils/enum";
import { GetAllExamRequest } from "./get-all-exam.request";
import { GetAllExamResponse } from "./get-all-exam.response";


@Controller('admin')
export class GetAllExamController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-all-exam')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllExam(
        @Query() getAllExamRequest: GetAllExamRequest,
        @Req() req: Request
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getAllExamAPI(adminId, getAllExamRequest);

            const response: GetAllExamResponse = {
                success: true,
                message: 'Exam data retrieved successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to retrieve exam',
            });

        }
    }
}