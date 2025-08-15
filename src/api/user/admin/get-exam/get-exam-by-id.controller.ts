import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { AdminService } from "src/services/user-service/admin/admin.service";
import { RoleGuard } from "src/guards/role.guard";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "src/utils/enum";
import { GetExamByIdRequest } from "./get-exam-by-id.request";
import { GetExamByIdResponse } from "./get-exam-by-id.response";


@Controller('admin')
export class GetExamByIdController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-exam/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getExamById(
        @Param() getExamByIdRequest: GetExamByIdRequest,
        @Req() req: Request
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getExamByIdAPI(adminId, getExamByIdRequest);

            const response: GetExamByIdResponse = {
                success: true,
                message: 'Exam retrieved successfully',
                data: result,
            };

            return response;

        } catch (error) {
            const response: GetExamByIdResponse = {
                success: false,
                message: error.message || 'Failed to get exam',
            };
            return response;
        }
    }
}