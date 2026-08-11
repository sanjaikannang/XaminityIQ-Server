import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { GetAllExamRoomsRequest } from './get-all-exam-rooms.request';
import { GetAllExamRoomsResponse } from './get-all-exam-rooms.response';

@Controller('admin')
export class GetAllExamRoomsController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Get('exam-rooms')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllExamRooms(@Query() query: GetAllExamRoomsRequest): Promise<GetAllExamRoomsResponse> {
        const data = await this.examManagementService.getAllExamRoomsOverviewAPI(query);

        return {
            success: true,
            message: 'Exam rooms fetched successfully',
            data,
        };
    }
}
