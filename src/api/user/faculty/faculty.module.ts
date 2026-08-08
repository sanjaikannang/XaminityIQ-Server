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

// Services
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

// Controllers
import { CreateSubjectController } from './subject-management/create-subject/create-subject.controller';
import { GetAllSubjectsController } from './subject-management/get-all-subjects/get-all-subjects.controller';
import { GetSubjectController } from './subject-management/get-subject/get-subject.controller';
import { EditSubjectController } from './subject-management/edit-subject/edit-subject.controller';
import { DeleteSubjectController } from './subject-management/delete-subject/delete-subject.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Faculty.name, schema: FacultySchema },
            { name: FacultyEmploymentDetail.name, schema: FacultyEmploymentDetailSchema },
            { name: Department.name, schema: DepartmentSchema },
            { name: Course.name, schema: CourseSchema },
            { name: Subject.name, schema: SubjectSchema },
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
        CreateSubjectController,
        GetAllSubjectsController,
        GetSubjectController,
        EditSubjectController,
        DeleteSubjectController,
    ],
    providers: [
        ConfigService,
        FacultyService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
    ],
})
export class FacultyModule { }
