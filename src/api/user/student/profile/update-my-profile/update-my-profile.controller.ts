import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { StudentService } from 'src/services/user-service/student/student.service';
import { UpdateMyStudentProfileRequest } from './update-my-profile.request';
import { UpdateMyProfileResponse } from './update-my-profile.response';

@Controller('student')
export class UpdateMyProfileController {
    constructor(private readonly studentService: StudentService) { }

    @Patch('profile')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async updateMyProfile(
        @Req() req: Request,
        @Body() data: UpdateMyStudentProfileRequest,
    ): Promise<UpdateMyProfileResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.studentService.updateMyProfileAPI(userId, data);

        return {
            success: true,
            message: result.message,
        };
    }
}
