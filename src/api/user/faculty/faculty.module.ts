import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';


// Module
import { RepositoryModule } from 'src/repositories/repository.module';
import { ServiceModule } from 'src/services/service.module';

// Controller
import { GetExamsController } from './get-exams/get-exams.controller';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Hms100msService } from 'src/100ms/100ms.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';
import { PasswordService } from 'src/services/auth-service/password.service';
import { ConfigService } from 'src/config/config.service';

// Schemas
import { Exam, ExamSchema } from 'src/schemas/Exam/exam.schema';
import { ExamRoom, ExamRoomSchema } from 'src/schemas/Exam/examRooms.schema';
import { StudentEnrollment, StudentEnrollmentSchema } from 'src/schemas/Exam/studentEnrollments.schema';
import { FacultyAssignment, FacultyAssignmentSchema } from 'src/schemas/Exam/facultyAssignments.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Exam.name, schema: ExamSchema },
            { name: ExamRoom.name, schema: ExamRoomSchema },
            { name: StudentEnrollment.name, schema: StudentEnrollmentSchema },
            { name: FacultyAssignment.name, schema: FacultyAssignmentSchema },
        ]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getJWTSecretKey(),
                signOptions: {
                    expiresIn: configService.getJWTExpiresIn(),
                },
            }),
        }),
        ServiceModule,
        RepositoryModule
    ],
    controllers: [
        GetExamsController
    ],
    providers: [
        ConfigService,
        AuthService,
        AuthJwtService,
        PasswordService,
        JwtAuthGuard,
        RoleGuard,
        CloudinaryService,
        Hms100msService
    ],
    exports: [
        ConfigService,
        AuthService,
        AuthJwtService,
        PasswordService,
        JwtAuthGuard,
        RoleGuard,
        CloudinaryService,
        Hms100msService
    ],
})
export class FacultyModule { }