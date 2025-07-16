import { Controller, Post, Body, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../../../auth/auth.service';
import { CreateStudentRequest } from './create-student.request';
import { CreateStudentResponse } from './create-student.response';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../../auth/guards/role.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from 'src/utils/enum';

@Controller('admin')
export class CreateStudentController {
    constructor(private readonly authService: AuthService) { }

    @Post('student/create')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createStudent(
        @Body() createStudentData: CreateStudentRequest,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        try {
            const adminId = req.user?.sub;

            const result = await this.authService.createStudentUser(adminId, createStudentData);

            const response: CreateStudentResponse = {
                success: true,
                message: 'Student created successfully',
                data: result,
            };

            res.status(HttpStatus.CREATED).json(response);
        } catch (error) {
            const response: CreateStudentResponse = {
                success: false,
                message: error.message || 'Failed to create student',
            };

            const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json(response);
        }
    }
}
