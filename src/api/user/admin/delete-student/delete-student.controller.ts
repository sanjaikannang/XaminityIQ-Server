import { Controller, UseGuards, Delete, Param, Req } from '@nestjs/common';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { DeleteStudentRequest } from './delete-student.request';
import { DeleteStudentResponse } from './delete-student.response';


@Controller('admin')
export class DeleteStudentController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Delete('delete-student/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteStudent(
        @Param() deleteStudentRequest: DeleteStudentRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.deleteStudentAPI(adminId, deleteStudentRequest);

            const response: DeleteStudentResponse = {
                success: true,
                message: 'Student Deleted successfully',
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to delete student',
            });

        }
    }
}
