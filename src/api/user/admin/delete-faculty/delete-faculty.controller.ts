import { Controller, UseGuards, Delete, Param, Req } from '@nestjs/common';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { DeleteFacultyRequest } from './delete-faculty.request';
import { DeleteFacultyResponse } from './delete-faculty.response';


@Controller('admin')
export class DeleteFacultyController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Delete('delete-faculty/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteFaculty(
        @Param() deleteFacultyRequest: DeleteFacultyRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.deleteFacultyAPI(adminId, deleteFacultyRequest);

            const response: DeleteFacultyResponse = {
                success: true,
                message: 'Faculty Deleted successfully',
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to delete faculty',
            });

        }
    }
}
