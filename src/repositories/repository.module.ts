import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

// Repositories
import { AdminRepositoryService } from "./admin-repository/admin.repository";
import { UserRepositoryService } from "./user-repository/user.repository";
import { BatchRepositoryService } from "./batch-repository/batch-repository";
import { CourseRepositoryService } from "./course-repository/course-repository";
import { BatchCourseRepositoryService } from "./batch-course-repository/batch-course-repository";


// Schemas
import { Admin, AdminSchema } from "src/schemas/admin.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { Batch, BatchSchema } from "src/schemas/batch.schema";
import { Course, CourseSchema } from "src/schemas/course.schema";
import { BatchCourse, BatchCourseSchema } from "src/schemas/batchCourse.schema";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: User.name, schema: UserSchema },
            { name: Batch.name, schema: BatchSchema },
            { name: Course.name, schema: CourseSchema },
            { name: BatchCourse.name, schema: BatchCourseSchema },
        ]),
    ],
    controllers: [],
    providers: [
        AdminRepositoryService,        
        UserRepositoryService,
        BatchRepositoryService,
        CourseRepositoryService,
        BatchCourseRepositoryService
    ],
    exports: [
        AdminRepositoryService,        
        UserRepositoryService,
        BatchRepositoryService,
        CourseRepositoryService,
        BatchCourseRepositoryService
    ],
})
export class RepositoryModule { }