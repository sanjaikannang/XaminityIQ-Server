import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { MapCourseToBatchResponse } from './map-course-to-batch.response';
import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { MapCourseToBatchRequest } from './map-course-to-batch.request';

@Controller('admin')
export class MapCourseToBatchController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('batches/:batchId/courses')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async mapCourseToBatch(
        @Param('batchId') batchId: string,
        @Body() mapCourseData: MapCourseToBatchRequest,
    ): Promise<MapCourseToBatchResponse> {
        const batchCourseId = await this.adminService.mapCourseToBatchAPI(batchId, mapCourseData);

        return {
            message: 'Course mapped to batch successfully',
            batchCourseId
        };
    }
}