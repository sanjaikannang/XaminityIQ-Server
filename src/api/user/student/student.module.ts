import { Get, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';


// Services
import { AgoraService } from 'src/agora/agora.service';
import { ConfigService } from 'src/config/config.service';


// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';


// Modules
import { RepositoryModule } from 'src/repositories/repository.module';
import { ServiceModule } from 'src/services/service.module';


// Schemas
import { AgoraToken, AgoraTokenSchema } from 'src/schemas/Exam/agoraToken.schema';
import { ChatMessage, ChatMessageSchema } from 'src/schemas/Exam/chatMessage.schema';
import { Exam, ExamSchema } from 'src/schemas/Exam/exam.schema';
import { ExamParticipant, ExamParticipantSchema } from 'src/schemas/Exam/examParticipant.schema';
import { JoinRequest, JoinRequestSchema } from 'src/schemas/Exam/joinRequest.schema';
import { StudentAction, StudentActionSchema } from 'src/schemas/Exam/studentAction.schema';


// Services
import { StudentService } from 'src/services/user-service/student/student.service';
import { CheckJoinStatusController } from './check-join-status/check-join-status.controller';
import { FinishExamController } from './finish-exam/finish-exam.controller';
import { GetStudentExamsController } from './get-student-exams/get-student-exams.controller';
import { GetStudentMessagesController } from './get-student-messages/get-student-messages.controller';
import { StudentJoinRequestController } from './student-join-request/student-join-request.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            // Exam
            { name: Exam.name, schema: ExamSchema },
            { name: AgoraToken.name, schema: AgoraTokenSchema },
            { name: ChatMessage.name, schema: ChatMessageSchema },
            { name: ExamParticipant.name, schema: ExamParticipantSchema },
            { name: JoinRequest.name, schema: JoinRequestSchema },
            { name: StudentAction.name, schema: StudentActionSchema }
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
        CheckJoinStatusController,
        FinishExamController,
        GetStudentExamsController,
        GetStudentMessagesController,
        StudentJoinRequestController
    ],
    providers: [
        ConfigService,
        JwtAuthGuard,
        RoleGuard,
        AgoraService,
        StudentService
    ],
    exports: [
        ConfigService,
        JwtAuthGuard,
        RoleGuard,
        AgoraService,
        StudentService
    ],
})
export class StudentModule { }