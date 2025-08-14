import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Schemas
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { Faculty, FacultySchema } from 'src/schemas/faculty.schema';
import { Session, SessionSchema } from 'src/schemas/session.schema';
import { Student, StudentSchema } from 'src/schemas/student.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

// Services
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';
import { PasswordService } from 'src/services/auth-service/password.service';
import { SessionService } from 'src/services/auth-service/session.service';

// Controllers
import { CreateFacultyController } from './create-faculty/create-faculty.controller';
import { CreateStudentController } from './create-student/create-student.controller';
import { DeleteFacultyController } from './delete-faculty/delete-faculty.controller';
import { DeleteStudentController } from './delete-student/delete-student.controller';
import { GetAllFacultyController } from './get-all-faculty/get-all-faculty.controller';
import { GetAllStudentController } from './get-all-student/get-all-student.controller';
import { GetFacultyController } from './get-faculty/get-faculty.controller';
import { GetStudentController } from './get-student/get-student.controller';
import { CreateBatchController } from './create-batch/create-batch.controller';
import { CreateCourseController } from './create-course/create-course.controller';
import { CreateBranchController } from './create-branch/create-branch.controller';
import { CreateSectionController } from './create-section/create-section.controller';
import { GetBranchesByCourseController } from './get-branches-by-course/get-branches-by-course.controller';
import { GetCoursesByBatchController } from './get-courses-by-batch/get-courses-by-batch.controller';
import { GetSectionsByBranchController } from './get-sections-by-branch/get-sections-by-branch.controller';
import { GetBatchesController } from './get-batches/get-batches.controller';
import { CreateExamController } from './create-exam/create-exam.controller';
import { GetAllExamController } from './get-all-exam/get-all-exam.controller';


// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Session.name, schema: SessionSchema },
            { name: Faculty.name, schema: FacultySchema },
            { name: Student.name, schema: StudentSchema },
            { name: Admin.name, schema: AdminSchema },
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
        CreateFacultyController,
        CreateStudentController,
        DeleteFacultyController,
        DeleteStudentController,
        GetAllFacultyController,
        GetAllStudentController,
        GetFacultyController,
        GetStudentController,
        CreateBatchController,
        CreateCourseController,
        CreateBranchController,
        CreateSectionController,
        GetBranchesByCourseController,
        GetCoursesByBatchController,
        GetSectionsByBranchController,
        GetBatchesController,
        CreateExamController,
        GetAllExamController
    ],
    providers: [
        ConfigService,
        AuthService,
        AuthJwtService,
        SessionService,
        PasswordService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
        AuthService,
        AuthJwtService,
        SessionService,
        JwtAuthGuard,
        RoleGuard,
    ],
})
export class AdminModule { }