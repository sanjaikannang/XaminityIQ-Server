import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from 'src/services/user-service/admin/dashboard.service';
import { GetDashboardOverviewResponse } from './get-dashboard-overview.response';

@Controller('admin')
export class GetDashboardOverviewController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('dashboard/overview')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getDashboardOverview(): Promise<GetDashboardOverviewResponse> {
        const data = await this.dashboardService.getDashboardOverviewAPI();

        return {
            success: true,
            message: 'Dashboard overview fetched successfully',
            data,
        };
    }
}
