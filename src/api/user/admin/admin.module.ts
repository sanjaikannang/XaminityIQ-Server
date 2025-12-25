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

// Services
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';
import { PasswordService } from 'src/services/auth-service/password.service';
import { AdminService } from 'src/services/user-service/admin/admin.service';

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

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Admin.name, schema: AdminSchema },
            { name: Batch.name, schema: BatchSchema },
            { name: Course.name, schema: CourseSchema },
            { name: BatchCourse.name, schema: BatchCourseSchema },
            { name: Department.name, schema: DepartmentSchema },
            { name: BatchDepartment.name, schema: BatchDepartmentSchema },
            { name: Section.name, schema: SectionSchema },
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
        GetDepartmentsByCourseController
    ],
    providers: [
        ConfigService,
        AuthService,
        AuthJwtService,
        PasswordService,
        AdminService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
        AuthService,
        AuthJwtService,
        AdminService,
        JwtAuthGuard,
        RoleGuard,
    ],
})
export class AdminModule { }