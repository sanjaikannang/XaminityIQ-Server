import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { PublishResultsResponse } from './publish-results.response';

@Controller('admin')
export class PublishResultsController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Post('exams/:id/publish-results')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async publishResults(@Param('id') id: string): Promise<PublishResultsResponse> {
        await this.examManagementService.publishResultsAPI(id);

        return {
            success: true,
            message: 'Results published successfully',
        };
    }
}
