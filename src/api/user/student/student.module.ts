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

// Services
import { StudentService } from 'src/services/user-service/student/student.service';

// Controllers
import { GetAllSubjectsController } from './subject-management/get-all-subjects/get-all-subjects.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Student.name, schema: StudentSchema },
            { name: StudentAcademicDetail.name, schema: StudentAcademicDetailSchema },
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
        GetAllSubjectsController,
    ],
    providers: [
        ConfigService,
        StudentService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
    ],
})
export class StudentModule { }
