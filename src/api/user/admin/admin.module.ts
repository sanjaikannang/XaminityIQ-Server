import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Schemas
import { Admin, AdminSchema } from 'src/schemas/User/Admin/admin.schema';
import { User, UserSchema } from 'src/schemas/User/user.schema';
import { Batch, BatchSchema } from 'src/schemas/Academic/batch.schema';
import { Course, CourseSchema } from 'src/schemas/Academic/course.schema';
import { BatchCourse, BatchCourseSchema } from 'src/schemas/Academic/batchCourse.schema';
import { Department, DepartmentSchema } from 'src/schemas/Academic/department.schema';
import { BatchDepartment, BatchDepartmentSchema } from 'src/schemas/Academic/batchDepartment.schema';
import { Section, SectionSchema } from 'src/schemas/Academic/section.schema';
import { Student, StudentSchema } from 'src/schemas/User/Student/student.schema';
import { StudentPersonalDetail, StudentPersonalDetailSchema } from 'src/schemas/User/Student/studentPersonalDetails.schema';
import { StudentParentDetail, StudentParentDetailSchema } from 'src/schemas/User/Student/studentParentDetail.schema';
import { StudentContactInformation, StudentContactInformationSchema } from 'src/schemas/User/Student/studentContactInformation.schema';
import { StudentEducationHistory, StudentEducationHistorySchema } from 'src/schemas/User/Student/studentEducationHistory.schema';
import { StudentAddressDetail, StudentAddressDetailSchema } from 'src/schemas/User/Student/studentAddressDetail.schema';
import { StudentAcademicDetail, StudentAcademicDetailSchema } from 'src/schemas/User/Student/studentAcademicDetail.schema';
import { Faculty, FacultySchema } from 'src/schemas/User/Faculty/faculty.schema';
import { FacultyPersonalDetail, FacultyPersonalDetailSchema } from 'src/schemas/User/Faculty/facultyPersonalDetail.schema';
import { FacultyContactInformation, FacultyContactInformationSchema } from 'src/schemas/User/Faculty/facultyContactInformation.schema';
import { FacultyAddress, FacultyAddressSchema } from 'src/schemas/User/Faculty/facultyAddressDetail.schema';
import { FacultyEducationHistory, FacultyEducationHistorySchema } from 'src/schemas/User/Faculty/facultyEducationHistory.schema';
import { FacultyEmploymentDetail, FacultyEmploymentDetailSchema } from 'src/schemas/User/Faculty/facultyEmploymentDetail.schema';
import { FacultyWorkExperience, FacultyWorkExperienceSchema } from 'src/schemas/User/Faculty/facultyWorkExperience.schema';
import { Exam, ExamSchema } from 'src/schemas/Exam/exam.schema';
import { AgoraToken, AgoraTokenSchema } from 'src/schemas/Exam/agoraToken.schema';
import { ChatMessage, ChatMessageSchema } from 'src/schemas/Exam/chatMessage.schema';
import { ExamParticipant, ExamParticipantSchema } from 'src/schemas/Exam/examParticipant.schema';
import { JoinRequest, JoinRequestSchema } from 'src/schemas/Exam/joinRequest.schema';
import { StudentAction, StudentActionSchema } from 'src/schemas/Exam/studentAction.schema';


// Services
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';
import { PasswordService } from 'src/services/auth-service/password.service';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { StudentManagementService } from 'src/services/user-service/admin/student-management.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FacultyManagementService } from 'src/services/user-service/admin/faculty-management.service';
import { AgoraService } from 'src/agora/agora.service';

// Controllers
import { CreateBatchController } from './create-batch/create-batch.controller';
import { MapCourseToBatchController } from './map-course-to-batch/map-course-to-batch.controller';
import { AddDepartmentToBatchCourseController } from './add-department-to-batch-course/add-department-to-batch-course.controller';
import { GetAllBatchesController } from './get-all-batches/get-all-batches.controller';
import { GetAllCoursesForBatchController } from './get-all-courses-for-batch/get-all-courses-for-batch.controller';
import { GetAllDepartmentForBatchCourseController } from './get-all-departments-for-batch-course/get-all-departments-for-batch-course.controller';
import { GetAllCoursesWithDepartmentsController } from './get-all-courses-with-departments/get-all-courses-with-departments.controller';
import { GetCoursesByBatchController } from './get-courses-by-batch/get-courses-by-batch.controller';
import { GetDepartmentsByCourseController } from './get-departments-by-course/get-departments-by-course.controller';
import { CreateStudentController } from './student-management/create-student/create-student.controller';
import { GetAllStudentsController } from './student-management/get-all-students/get-all-students.controller';
import { GetStudentController } from './student-management/get-student/get-student.controller';
import { BulkUploadStudentsController } from './student-management/bulk-upload-student/bulk-upload-students.controller';
import { CreateFacultyController } from './faculty-management/create-faculty/create-faculty.controller';
import { GetFacultyController } from './faculty-management/get-faculty/get-faculty.controller';
import { GetAllFacultyController } from './faculty-management/get-all-faculty/get-all-faculty.controller';
import { CreateExamController } from './create-exam/create-exam.controller';

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        MongooseModule.forFeature([
            // User
            { name: User.name, schema: UserSchema },
            { name: Admin.name, schema: AdminSchema },

            // Academic
            { name: Batch.name, schema: BatchSchema },
            { name: Course.name, schema: CourseSchema },
            { name: BatchCourse.name, schema: BatchCourseSchema },
            { name: Department.name, schema: DepartmentSchema },
            { name: BatchDepartment.name, schema: BatchDepartmentSchema },
            { name: Section.name, schema: SectionSchema },

            // Student
            { name: Student.name, schema: StudentSchema },
            { name: StudentPersonalDetail.name, schema: StudentPersonalDetailSchema },
            { name: StudentParentDetail.name, schema: StudentParentDetailSchema },
            { name: StudentContactInformation.name, schema: StudentContactInformationSchema },
            { name: StudentEducationHistory.name, schema: StudentEducationHistorySchema },
            { name: StudentAddressDetail.name, schema: StudentAddressDetailSchema },
            { name: StudentAcademicDetail.name, schema: StudentAcademicDetailSchema },

            // Faculty
            { name: Faculty.name, schema: FacultySchema },
            { name: FacultyPersonalDetail.name, schema: FacultyPersonalDetailSchema },
            { name: FacultyContactInformation.name, schema: FacultyContactInformationSchema },
            { name: FacultyAddress.name, schema: FacultyAddressSchema },
            { name: FacultyEducationHistory.name, schema: FacultyEducationHistorySchema },
            { name: FacultyEmploymentDetail.name, schema: FacultyEmploymentDetailSchema },
            { name: FacultyWorkExperience.name, schema: FacultyWorkExperienceSchema },

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
        CreateBatchController,
        MapCourseToBatchController,
        AddDepartmentToBatchCourseController,
        GetAllBatchesController,
        GetAllCoursesForBatchController,
        GetAllDepartmentForBatchCourseController,
        GetAllCoursesWithDepartmentsController,
        GetCoursesByBatchController,
        GetDepartmentsByCourseController,
        CreateStudentController,
        GetAllStudentsController,
        GetStudentController,
        BulkUploadStudentsController,
        CreateFacultyController,
        GetFacultyController,
        GetAllFacultyController,
        CreateExamController
    ],
    providers: [
        ConfigService,
        AuthService,
        AuthJwtService,
        PasswordService,
        AdminService,
        StudentManagementService,
        FacultyManagementService,
        JwtAuthGuard,
        RoleGuard,
        CloudinaryService,
        AgoraService
    ],
    exports: [
        ConfigService,
        AuthService,
        AuthJwtService,
        AdminService,
        StudentManagementService,
        FacultyManagementService,
        JwtAuthGuard,
        RoleGuard,
        CloudinaryService,
        AgoraService
    ],
})
export class AdminModule { }