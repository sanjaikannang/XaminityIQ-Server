import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { AdminService } from "src/services/user-service/admin/admin.service";
import { RoleGuard } from "src/guards/role.guard";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "src/utils/enum";
import { GetFacultyResponse } from "./get-faculty.response";
import { GetFacultyRequest } from "./get-faculty.request";


@Controller('admin')
export class GetFacultyController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-faculty/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getFaculty(
        @Param() getFacultyRequest: GetFacultyRequest,
        @Req() req: Request
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getFacultyAPI(adminId, getFacultyRequest);

            const response: GetFacultyResponse = {
                success: true,
                message: 'Faculty data retrieved successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to retrieve faculty data',
            });

        }
    }
}