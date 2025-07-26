import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { AdminService } from "src/services/user-service/admin/admin.service";
import { GetAllFacultyResponse } from "./get-all-faculty.response";
import { GetAllFacultyRequest } from "./get-all-faculty.request";
import { RoleGuard } from "src/guards/role.guard";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "src/utils/enum";


@Controller('admin')
export class GetAllFacultyController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-all-faculty')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllFaculty(
        @Query() getAllFacultyRequest: GetAllFacultyRequest,
        @Req() req: Request
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getAllFacultyAPI(adminId, getAllFacultyRequest);

            const response: GetAllFacultyResponse = {
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