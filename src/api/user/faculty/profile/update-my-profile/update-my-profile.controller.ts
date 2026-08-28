import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { UpdateMyFacultyProfileRequest } from './update-my-profile.request';
import { UpdateMyProfileResponse } from './update-my-profile.response';

@Controller('faculty')
export class UpdateMyProfileController {
    constructor(private readonly facultyService: FacultyService) { }

    @Patch('profile')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async updateMyProfile(
        @Req() req: Request,
        @Body() data: UpdateMyFacultyProfileRequest,
    ): Promise<UpdateMyProfileResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.facultyService.updateMyProfileAPI(userId, data);

        return {
            success: true,
            message: result.message,
        };
    }
}
