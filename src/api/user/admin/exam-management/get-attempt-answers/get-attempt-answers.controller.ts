import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { GetAttemptAnswersResponse } from './get-attempt-answers.response';

@Controller('admin')
export class GetAttemptAnswersController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Get('attempts/:attemptId/answers')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAttemptAnswers(@Param('attemptId') attemptId: string): Promise<GetAttemptAnswersResponse> {
        const data = await this.examManagementService.getAttemptAnswersAPI(attemptId);

        return {
            success: true,
            message: 'Attempt answers fetched successfully',
            data,
        };
    }
}
