import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateStudentRequest } from './create-student.request';
import { CreateStudentResponse } from './create-student.response';
import { Controller, Post, Body, UseGuards, UploadedFile, BadRequestException } from '@nestjs/common';
import { StudentManagementService } from 'src/services/user-service/admin/student-management.service';

@Controller('admin')
export class CreateStudentController {
    constructor(private readonly studentManagementService: StudentManagementService) { }

    @Post('students')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createStudent(
        @Body() createStudentData: CreateStudentRequest,
        // @UploadedFile() profilePhoto: Express.Multer.File,
    ) {
        // if (!profilePhoto) {
        //     throw new BadRequestException('Profile photo is required');
        // }

        // // Validate file type
        // const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        // if (!allowedMimeTypes.includes(profilePhoto.mimetype)) {
        //     throw new BadRequestException('Only JPEG, PNG images are allowed');
        // }

        // // Validate file size (5MB max)
        // const maxSize = 5 * 1024 * 1024; // 5MB
        // if (profilePhoto.size > maxSize) {
        //     throw new BadRequestException('File size should not exceed 5MB');
        // }

        // await this.studentManagementService.createStudentAPI(createStudentData, profilePhoto.buffer);
        await this.studentManagementService.createStudentAPI(createStudentData);

        const response: CreateStudentResponse = {
            success: true,
            message: 'Student Created Successfully'
        };

        return response;
    }
}