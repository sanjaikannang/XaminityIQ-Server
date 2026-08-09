import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/config/config.service';
import { RepositoryModule } from 'src/repositories/repository.module';
import { ServiceModule } from 'src/services/service.module';
import { MongooseModule } from '@nestjs/mongoose';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Schemas
import { Student, StudentSchema } from 'src/schemas/User/Student/student.schema';
import { StudentAcademicDetail, StudentAcademicDetailSchema } from 'src/schemas/User/Student/studentAcademicDetail.schema';
import { Subject, SubjectSchema } from 'src/schemas/Academic/subject.schema';
import { Exam, ExamSchema } from 'src/schemas/Exam/exam.schema';
import { ExamQuestion, ExamQuestionSchema } from 'src/schemas/Exam/examQuestion.schema';
import { ExamAttempt, ExamAttemptSchema } from 'src/schemas/Exam/examAttempt.schema';
import { ExamAnswer, ExamAnswerSchema } from 'src/schemas/Exam/examAnswer.schema';
import { ExamRecording, ExamRecordingSchema } from 'src/schemas/Exam/examRecording.schema';
import { ExamRoom, ExamRoomSchema } from 'src/schemas/Exam/examRoom.schema';
import { ExamRoomAssignment, ExamRoomAssignmentSchema } from 'src/schemas/Exam/examRoomAssignment.schema';
import { ExamRoomChatMessage, ExamRoomChatMessageSchema } from 'src/schemas/Exam/examRoomChatMessage.schema';

// Services
import { StudentService } from 'src/services/user-service/student/student.service';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { LiveKitService } from 'src/livekit/livekit.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';

// Controllers
import { GetAllSubjectsController } from './subject-management/get-all-subjects/get-all-subjects.controller';
import { GetAllExamsController } from './exam-management/get-all-exams/get-all-exams.controller';
import { StartAttemptController } from './exam-management/start-attempt/start-attempt.controller';
import { GetAttemptController } from './exam-management/get-attempt/get-attempt.controller';
import { SaveAnswerController } from './exam-management/save-answer/save-answer.controller';
import { SubmitAttemptController } from './exam-management/submit-attempt/submit-attempt.controller';
import { ReportViolationController } from './exam-management/report-violation/report-violation.controller';
import { RecordingSignatureController } from './exam-management/recording-signature/recording-signature.controller';
import { RecordChunkController } from './exam-management/record-chunk/record-chunk.controller';
import { FinalizeRecordingController } from './exam-management/finalize-recording/finalize-recording.controller';
import { NetworkProbeController } from './exam-management/network-probe/network-probe.controller';
import { JoinLobbyController } from './exam-proctoring/join-lobby/join-lobby.controller';
import { GetLobbyStatusController } from './exam-proctoring/get-lobby-status/get-lobby-status.controller';
import { GetLiveKitTokenController } from './exam-proctoring/get-livekit-token/get-livekit-token.controller';
import { SendChatController } from './exam-proctoring/send-chat/send-chat.controller';
import { GetChatHistoryController } from './exam-proctoring/get-chat-history/get-chat-history.controller';
import { GenerateWrittenQrController } from './exam-management/generate-written-qr/generate-written-qr.controller';
import { GetWrittenQrStatusController } from './exam-management/get-written-qr-status/get-written-qr-status.controller';
import { FinalizeWrittenAnswerController } from './exam-management/finalize-written-answer/finalize-written-answer.controller';
import { GetMyResultController } from './exam-management/get-my-result/get-my-result.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Student.name, schema: StudentSchema },
            { name: StudentAcademicDetail.name, schema: StudentAcademicDetailSchema },
            { name: Subject.name, schema: SubjectSchema },
            { name: Exam.name, schema: ExamSchema },
            { name: ExamQuestion.name, schema: ExamQuestionSchema },
            { name: ExamAttempt.name, schema: ExamAttemptSchema },
            { name: ExamAnswer.name, schema: ExamAnswerSchema },
            { name: ExamRecording.name, schema: ExamRecordingSchema },
            { name: ExamRoom.name, schema: ExamRoomSchema },
            { name: ExamRoomAssignment.name, schema: ExamRoomAssignmentSchema },
            { name: ExamRoomChatMessage.name, schema: ExamRoomChatMessageSchema },
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
        GetAllSubjectsController,
        GetAllExamsController,
        StartAttemptController,
        GetAttemptController,
        SaveAnswerController,
        SubmitAttemptController,
        ReportViolationController,
        RecordingSignatureController,
        RecordChunkController,
        FinalizeRecordingController,
        NetworkProbeController,
        JoinLobbyController,
        GetLobbyStatusController,
        GetLiveKitTokenController,
        SendChatController,
        GetChatHistoryController,
        GenerateWrittenQrController,
        GetWrittenQrStatusController,
        FinalizeWrittenAnswerController,
        GetMyResultController,
    ],
    providers: [
        ConfigService,
        StudentService,
        ExamAttemptService,
        CloudinaryService,
        LiveKitService,
        AuthJwtService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
    ],
})
export class StudentModule { }
