import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { AdminService } from "src/services/user-service/admin/admin.service";
import { RoleGuard } from "src/guards/role.guard";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "src/utils/enum";
import { GetAllStudentRequest } from "./get-all-student.request";
import { GetAllStudentResponse } from "./get-all-student.response";


@Controller('admin')
export class GetAllStudentController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-all-student')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllFaculty(
        @Query() getAllStudentRequest: GetAllStudentRequest,
        @Req() req: Request
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getAllStudentAPI(adminId, getAllStudentRequest);

            const response: GetAllStudentResponse = {
                success: true,
                message: 'Student data retrieved successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to retrieve student data',
            });

        }
    }
}