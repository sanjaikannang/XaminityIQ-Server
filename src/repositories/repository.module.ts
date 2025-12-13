import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

// Repositories
import { AdminRepositoryService } from "./admin-repository/admin.repository";
import { UserRepositoryService } from "./user-repository/user.repository";
import { BatchRepositoryService } from "./batch-repository/batch-repository";
import { CourseRepositoryService } from "./course-repository/course-repository";
import { BatchCourseRepositoryService } from "./batch-course-repository/batch-course-repository";
import { DepartmentRepositoryService } from "./department-repository/department-repository";
import { BatchDepartmentRepositoryService } from "./batch-department-repository/batch-department-repository";
import { SectionRepositoryService } from "./section-repository/section-repository";


// Schemas
import { Admin, AdminSchema } from "src/schemas/admin.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { Batch, BatchSchema } from "src/schemas/batch.schema";
import { Course, CourseSchema } from "src/schemas/course.schema";
import { BatchCourse, BatchCourseSchema } from "src/schemas/batchCourse.schema";
import { Department, DepartmentSchema } from "src/schemas/department.schema";
import { BatchDepartment, BatchDepartmentSchema } from "src/schemas/batchDepartment.schema";
import { Section, SectionSchema } from "src/schemas/section.schema";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: User.name, schema: UserSchema },
            { name: Batch.name, schema: BatchSchema },
            { name: Course.name, schema: CourseSchema },
            { name: BatchCourse.name, schema: BatchCourseSchema },
            { name: Department.name, schema: DepartmentSchema },
            { name: BatchDepartment.name, schema: BatchDepartmentSchema },
            { name: Section.name, schema: SectionSchema },
        ]),
    ],
    controllers: [],
    providers: [
        AdminRepositoryService,
        UserRepositoryService,
        BatchRepositoryService,
        CourseRepositoryService,
        BatchCourseRepositoryService,
        DepartmentRepositoryService,
        BatchDepartmentRepositoryService,
        SectionRepositoryService
    ],
    exports: [
        AdminRepositoryService,
        UserRepositoryService,
        BatchRepositoryService,
        CourseRepositoryService,
        BatchCourseRepositoryService,
        DepartmentRepositoryService,
        BatchDepartmentRepositoryService,
        SectionRepositoryService
    ],
})
export class RepositoryModule { }