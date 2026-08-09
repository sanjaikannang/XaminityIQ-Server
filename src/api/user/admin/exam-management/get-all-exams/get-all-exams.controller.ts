import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { GetAllExamsRequest } from './get-all-exams.request';
import { GetAllExamsResponse } from './get-all-exams.response';

@Controller('admin')
export class GetAllExamsController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Get('exams')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllExams(@Query() query: GetAllExamsRequest): Promise<GetAllExamsResponse> {
        const result = await this.examManagementService.getAllExamsAPI(query);

        return {
            success: true,
            message: 'Exams fetched successfully',
            data: result.exams,
            pagination: result.pagination,
        };
    }
}
