import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { EvaluateAnswerRequest } from './evaluate-answer.request';
import { EvaluateAnswerResponse } from './evaluate-answer.response';

@Controller('faculty')
export class EvaluateAnswerController {
    constructor(private readonly facultyService: FacultyService) { }

    @Patch('evaluation/answers/:answerId')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async evaluateAnswer(
        @Req() req: Request,
        @Param('answerId') answerId: string,
        @Body() data: EvaluateAnswerRequest,
    ): Promise<EvaluateAnswerResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.facultyService.evaluateAnswerAPI(userId, answerId, data.marksAwarded, data.remarks);

        return {
            success: true,
            ...result,
        };
    }
}
