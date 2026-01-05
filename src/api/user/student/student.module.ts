import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';


// Module
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';


// Controller
import { GetExamsController } from './get-exams/get-exams.controller';
import { CheckJoinRequestStatusController } from './check-join-request-status/check-join-request-status.controller';
import { GetExamDetailsController } from './get-exam-details/get-exam-details.controller';
import { JoinExamRoomController } from './join-exam-room/join-exam-room.controller';
import { RequestJoinExamController } from './request-join-exam/request-join-exam.controller';
import { UpdateStudentLeftController } from './update-student-left/update-student-left.controller';


// Guards
import { RoleGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';


// Services
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';
import { PasswordService } from 'src/services/auth-service/password.service';
import { Hms100msService } from 'src/100ms/100ms.service';


// Schemas
import { Exam, ExamSchema } from 'src/schemas/Exam/exam.schema';
import { ExamRoom, ExamRoomSchema } from 'src/schemas/Exam/examRooms.schema';
import { StudentEnrollment, StudentEnrollmentSchema } from 'src/schemas/Exam/studentEnrollments.schema';
import { FacultyAssignment, FacultyAssignmentSchema } from 'src/schemas/Exam/facultyAssignments.schema';
import { StudentJoinRequest, StudentJoinRequestSchema } from 'src/schemas/Exam/studentJoinRequest.schema';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Exam.name, schema: ExamSchema },
            { name: ExamRoom.name, schema: ExamRoomSchema },
            { name: StudentEnrollment.name, schema: StudentEnrollmentSchema },
            { name: FacultyAssignment.name, schema: FacultyAssignmentSchema },
            { name: StudentJoinRequest.name, schema: StudentJoinRequestSchema },
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
        CheckJoinRequestStatusController,
        GetExamDetailsController,
        GetExamsController,
        JoinExamRoomController,
        RequestJoinExamController,
        UpdateStudentLeftController
    ],
    providers: [
        ConfigService,
        AuthService,
        AuthJwtService,
        PasswordService,
        JwtAuthGuard,
        RoleGuard,
        Hms100msService
    ],
    exports: [
        ConfigService,
        AuthService,
        AuthJwtService,
        PasswordService,
        JwtAuthGuard,
        RoleGuard,
        Hms100msService
    ],
})
export class StudentModule { }