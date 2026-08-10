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
import { Faculty, FacultySchema } from 'src/schemas/User/Faculty/faculty.schema';
import { FacultyEmploymentDetail, FacultyEmploymentDetailSchema } from 'src/schemas/User/Faculty/facultyEmploymentDetail.schema';
import { Department, DepartmentSchema } from 'src/schemas/Academic/department.schema';
import { Course, CourseSchema } from 'src/schemas/Academic/course.schema';
import { Subject, SubjectSchema } from 'src/schemas/Academic/subject.schema';
import { Student, StudentSchema } from 'src/schemas/User/Student/student.schema';
import { StudentAcademicDetail, StudentAcademicDetailSchema } from 'src/schemas/User/Student/studentAcademicDetail.schema';
import { StudentPersonalDetail, StudentPersonalDetailSchema } from 'src/schemas/User/Student/studentPersonalDetails.schema';
import { Exam, ExamSchema } from 'src/schemas/Exam/exam.schema';
import { ExamQuestion, ExamQuestionSchema } from 'src/schemas/Exam/examQuestion.schema';
import { ExamAttempt, ExamAttemptSchema } from 'src/schemas/Exam/examAttempt.schema';
import { ExamAnswer, ExamAnswerSchema } from 'src/schemas/Exam/examAnswer.schema';
import { ExamRecording, ExamRecordingSchema } from 'src/schemas/Exam/examRecording.schema';
import { ExamRoom, ExamRoomSchema } from 'src/schemas/Exam/examRoom.schema';
import { ExamRoomAssignment, ExamRoomAssignmentSchema } from 'src/schemas/Exam/examRoomAssignment.schema';
import { ExamRoomChatMessage, ExamRoomChatMessageSchema } from 'src/schemas/Exam/examRoomChatMessage.schema';

// Services
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { LiveKitService } from 'src/livekit/livekit.service';

// Controllers
import { GetMyProfileController } from './profile/get-my-profile/get-my-profile.controller';
import { CreateSubjectController } from './subject-management/create-subject/create-subject.controller';
import { GetAllSubjectsController } from './subject-management/get-all-subjects/get-all-subjects.controller';
import { GetSubjectController } from './subject-management/get-subject/get-subject.controller';
import { EditSubjectController } from './subject-management/edit-subject/edit-subject.controller';
import { DeleteSubjectController } from './subject-management/delete-subject/delete-subject.controller';
import { GetMyExamRoomsController } from './exam-proctoring/get-my-exam-rooms/get-my-exam-rooms.controller';
import { GetExamRoomDetailController } from './exam-proctoring/get-exam-room-detail/get-exam-room-detail.controller';
import { AdmitStudentController } from './exam-proctoring/admit-student/admit-student.controller';
import { RejectStudentController } from './exam-proctoring/reject-student/reject-student.controller';
import { RemoveStudentController } from './exam-proctoring/remove-student/remove-student.controller';
import { SendChatController } from './exam-proctoring/send-chat/send-chat.controller';
import { GetChatHistoryController } from './exam-proctoring/get-chat-history/get-chat-history.controller';
import { GetLiveKitTokenController } from './exam-proctoring/get-livekit-token/get-livekit-token.controller';
import { GetMyEvaluationExamsController } from './exam-evaluation/get-my-evaluation-exams/get-my-evaluation-exams.controller';
import { GetExamAnswersForEvaluationController } from './exam-evaluation/get-exam-answers-for-evaluation/get-exam-answers-for-evaluation.controller';
import { EvaluateAnswerController } from './exam-evaluation/evaluate-answer/evaluate-answer.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Faculty.name, schema: FacultySchema },
            { name: FacultyEmploymentDetail.name, schema: FacultyEmploymentDetailSchema },
            { name: Department.name, schema: DepartmentSchema },
            { name: Course.name, schema: CourseSchema },
            { name: Subject.name, schema: SubjectSchema },
            { name: Student.name, schema: StudentSchema },
            { name: StudentAcademicDetail.name, schema: StudentAcademicDetailSchema },
            { name: StudentPersonalDetail.name, schema: StudentPersonalDetailSchema },
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
        GetMyProfileController,
        CreateSubjectController,
        GetAllSubjectsController,
        GetSubjectController,
        EditSubjectController,
        DeleteSubjectController,
        GetMyExamRoomsController,
        GetExamRoomDetailController,
        AdmitStudentController,
        RejectStudentController,
        RemoveStudentController,
        SendChatController,
        GetChatHistoryController,
        GetLiveKitTokenController,
        GetMyEvaluationExamsController,
        GetExamAnswersForEvaluationController,
        EvaluateAnswerController,
    ],
    providers: [
        ConfigService,
        FacultyService,
        ExamAttemptService,
        CloudinaryService,
        LiveKitService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
    ],
})
export class FacultyModule { }
