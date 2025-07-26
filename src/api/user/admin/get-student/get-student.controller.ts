import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { AdminService } from "src/services/user-service/admin/admin.service";
import { GetStudentResponse } from "./get-student.response";
import { GetStudentRequest } from "./get-student.request";
import { RoleGuard } from "src/guards/role.guard";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "src/utils/enum";

@Controller('admin')
export class GetStudentController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-student/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getStudent(
        @Param() getStudentRequest: GetStudentRequest,
        @Req() req: Request
    ) {
        try {
            const adminId = (req as any).user?.sub;            

            const result = await this.adminService.getStudentAPI(adminId, getStudentRequest);

            const response: GetStudentResponse = {
                success: true,
                message: 'Student data retrieved successfully',
                data: result,
            };

            return response;

        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to retrieve student data',
            };
        }
    }
}