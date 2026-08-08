import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetDepartmentSectionsResponse } from './get-department-sections.response';

@Controller('admin')
export class GetDepartmentSectionsController {
    constructor(private readonly adminService: AdminService) { }

    @Get('batch-departments/:batchDepartmentId/sections')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getDepartmentSections(
        @Param('batchDepartmentId') batchDepartmentId: string,
    ): Promise<GetDepartmentSectionsResponse> {

        const result = await this.adminService.getDepartmentSectionsAPI(batchDepartmentId);

        const response: GetDepartmentSectionsResponse = {
            success: true,
            message: 'Department Sections Fetched Successfully',
            data: result,
        };

        return response;
    }
}
