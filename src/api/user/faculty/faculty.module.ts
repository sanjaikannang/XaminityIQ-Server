import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';


// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';


// Services
import { ConfigService } from 'src/config/config.service';
import { AgoraService } from 'src/agora/agora.service';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';


// Modules
import { RepositoryModule } from 'src/repositories/repository.module';
import { ServiceModule } from 'src/services/service.module';


// Schemas
import { Exam, ExamSchema } from 'src/schemas/Exam/exam.schema';
import { AgoraToken, AgoraTokenSchema } from 'src/schemas/Exam/agoraToken.schema';
import { ChatMessage, ChatMessageSchema } from 'src/schemas/Exam/chatMessage.schema';
import { ExamParticipant, ExamParticipantSchema } from 'src/schemas/Exam/examParticipant.schema';
import { JoinRequest, JoinRequestSchema } from 'src/schemas/Exam/joinRequest.schema';
import { StudentAction, StudentActionSchema } from 'src/schemas/Exam/studentAction.schema';


// Controllers
import { ApproveJoinRequestController } from './approve-join-request/approve-join-request.controller';
import { EndExamController } from './end-exam/end-exam.controller';
import { FacultyJoinExamController } from './faculty-join-exam/faculty-join-exam.controller';
import { GetChatHistoryController } from './get-chat-history/get-chat-history.controller';
import { GetFacultyExamsController } from './get-faculty-exams/get-faculty-exams.controller';
import { GetPendingJoinRequestsController } from './get-pending-join-requests/get-pending-join-requests.controller';
import { RejectJoinRequestController } from './reject-join-request/reject-join-request.controller';
import { RemoveStudentController } from './remove-student/remove-student.controller';
import { SendMessageController } from './send-message/send-message.controller';


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
        ApproveJoinRequestController,
        EndExamController,
        FacultyJoinExamController,
        GetChatHistoryController,
        GetFacultyExamsController,
        GetPendingJoinRequestsController,
        RejectJoinRequestController,
        RemoveStudentController,
        SendMessageController
    ],
    providers: [
        ConfigService,
        JwtAuthGuard,
        RoleGuard,
        AgoraService,
        FacultyService
    ],
    exports: [
        ConfigService,
        JwtAuthGuard,
        RoleGuard,
        AgoraService,
        FacultyService
    ],
})
export class FacultyModule { }