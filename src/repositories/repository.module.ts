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
import { StudentRepositoryService } from "./student-repository/student-repository.service";
import { StudentPersonalDetailRepositoryService } from "./student-personal-detail-repository/student-personal-detail-repository.service";
import { StudentParentDetailRepositoryService } from "./student-parent-detail-repository/student-parent-detail-repository.service";
import { StudentContactInformationRepositoryService } from "./student-contact-information-repository/student-contact-information-repository.service";
import { StudentAddressDetailRepositoryService } from "./student-address-detail-repository/student-address-detail-repository.service";
import { StudentEducationHistoryRepositoryService } from "./student-education-history-repository/student-education-history-repository.service";
import { StudentAcademicDetailRepositoryService } from "./student-academic-detail-repository/student-academic-detail-repository.service";


// Schemas
import { Admin, AdminSchema } from "src/schemas/User/Admin/admin.schema";
import { User, UserSchema } from "src/schemas/User/user.schema";
import { Batch, BatchSchema } from "src/schemas/Academic/batch.schema";
import { Course, CourseSchema } from "src/schemas/Academic/course.schema";
import { BatchCourse, BatchCourseSchema } from "src/schemas/Academic/batchCourse.schema";
import { Department, DepartmentSchema } from "src/schemas/Academic/department.schema";
import { BatchDepartment, BatchDepartmentSchema } from "src/schemas/Academic/batchDepartment.schema";
import { Section, SectionSchema } from "src/schemas/Academic/section.schema";
import { Student, StudentSchema } from "src/schemas/User/Student/student.schema";
import { StudentPersonalDetail, StudentPersonalDetailSchema } from "src/schemas/User/Student/studentPersonalDetails.schema";
import { StudentParentDetail, StudentParentDetailSchema } from "src/schemas/User/Student/studentParentDetail.schema";
import { StudentEducationHistory, StudentEducationHistorySchema } from "src/schemas/User/Student/studentEducationHistory.schema";
import { StudentContactInformation, StudentContactInformationSchema } from "src/schemas/User/Student/studentContactInformation.schema";
import { StudentAddressDetail, StudentAddressDetailSchema } from "src/schemas/User/Student/studentAddressDetail.schema";
import { StudentAcademicDetail, StudentAcademicDetailSchema } from "src/schemas/User/Student/studentAcademicDetail.schema";

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
            { name: Student.name, schema: StudentSchema },
            { name: StudentPersonalDetail.name, schema: StudentPersonalDetailSchema },
            { name: StudentParentDetail.name, schema: StudentParentDetailSchema },
            { name: StudentContactInformation.name, schema: StudentContactInformationSchema },
            { name: StudentEducationHistory.name, schema: StudentEducationHistorySchema },
            { name: StudentAddressDetail.name, schema: StudentAddressDetailSchema },
            { name: StudentAcademicDetail.name, schema: StudentAcademicDetailSchema },                    
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
        SectionRepositoryService,
        StudentRepositoryService,
        StudentPersonalDetailRepositoryService,
        StudentParentDetailRepositoryService,
        StudentContactInformationRepositoryService,
        StudentEducationHistoryRepositoryService,
        StudentAddressDetailRepositoryService,
        StudentAcademicDetailRepositoryService
    ],
    exports: [
        AdminRepositoryService,
        UserRepositoryService,
        BatchRepositoryService,
        CourseRepositoryService,
        BatchCourseRepositoryService,
        DepartmentRepositoryService,
        BatchDepartmentRepositoryService,
        SectionRepositoryService,
        StudentRepositoryService,
        StudentPersonalDetailRepositoryService,
        StudentParentDetailRepositoryService,
        StudentContactInformationRepositoryService,
        StudentEducationHistoryRepositoryService,
        StudentAddressDetailRepositoryService,
        StudentAcademicDetailRepositoryService
    ],
})
export class RepositoryModule { }