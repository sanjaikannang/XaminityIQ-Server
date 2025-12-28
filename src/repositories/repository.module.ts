import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

// Repositories
import { AdminRepositoryService } from "./admin-repository/admin.repository";
import { UserRepositoryService } from "./user-repository/user.repository";
import { BatchRepositoryService } from "./batch-repository/batch.repository";
import { CourseRepositoryService } from "./course-repository/course.repository";
import { BatchCourseRepositoryService } from "./batch-course-repository/batch-course.repository";
import { DepartmentRepositoryService } from "./department-repository/department.repository";
import { BatchDepartmentRepositoryService } from "./batch-department-repository/batch-department.repository";
import { SectionRepositoryService } from "./section-repository/section.repository";
import { StudentRepositoryService } from "./student-repository/student.repository";
import { StudentPersonalDetailRepositoryService } from "./student-personal-detail-repository/student-personal-detail.repository";
import { StudentParentDetailRepositoryService } from "./student-parent-detail-repository/student-parent-detail.repository";
import { StudentContactInformationRepositoryService } from "./student-contact-information-repository/student-contact-information.repository";
import { StudentAddressDetailRepositoryService } from "./student-address-detail-repository/student-address-detail.repository";
import { StudentEducationHistoryRepositoryService } from "./student-education-history-repository/student-education-history.repository";
import { StudentAcademicDetailRepositoryService } from "./student-academic-detail-repository/student-academic-detail.repository";


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
import { Faculty, FacultySchema } from "src/schemas/User/Faculty/faculty.schema";
import { FacultyPersonalDetail, FacultyPersonalDetailSchema } from "src/schemas/User/Faculty/facultyPersonalDetail.schema";
import { FacultyContactInformation, FacultyContactInformationSchema } from "src/schemas/User/Faculty/facultyContactInformation.schema";
import { FacultyAddress, FacultyAddressSchema } from "src/schemas/User/Faculty/facultyAddressDetail.schema";
import { FacultyEducationHistory, FacultyEducationHistorySchema } from "src/schemas/User/Faculty/facultyEducationHistory.schema";
import { FacultyEmploymentDetail, FacultyEmploymentDetailSchema } from "src/schemas/User/Faculty/facultyEmploymentDetail.schema";
import { FacultyWorkExperience, FacultyWorkExperienceSchema } from "src/schemas/User/Faculty/facultyWorkExperience.schema";
import { FacultyRepositoryService } from "./faculty-repository/faculty.repository";
import { FacultyPersonalDetailRepositoryService } from "./faculty-personal-detail-repository/faculty-personal-detail.repository";
import { FacultyContactInformationRepositoryService } from "./faculty-contact-information-repository/faculty-contact-information.repository";
import { FacultyAddressRepositoryService } from "./faculty-address-repository/faculty-address.repository";
import { FacultyEducationHistoryRepositoryService } from "./faculty-education-history-repository/faculty-education-history.repository";
import { FacultyEmploymentDetailRepositoryService } from "./faculty-employment-detail-repository/faculty-employment-detail.repository";
import { FacultyWorkExperienceRepositoryService } from "./faculty-work-experience-repository/faculty-work-experience.repository";

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
            { name: Faculty.name, schema: FacultySchema },
            { name: FacultyPersonalDetail.name, schema: FacultyPersonalDetailSchema },
            { name: FacultyContactInformation.name, schema: FacultyContactInformationSchema },
            { name: FacultyAddress.name, schema: FacultyAddressSchema },
            { name: FacultyEducationHistory.name, schema: FacultyEducationHistorySchema },
            { name: FacultyEmploymentDetail.name, schema: FacultyEmploymentDetailSchema },
            { name: FacultyWorkExperience.name, schema: FacultyWorkExperienceSchema },
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
        StudentAcademicDetailRepositoryService,
        FacultyRepositoryService,
        FacultyPersonalDetailRepositoryService,
        FacultyContactInformationRepositoryService,
        FacultyAddressRepositoryService,
        FacultyEducationHistoryRepositoryService,
        FacultyEmploymentDetailRepositoryService,
        FacultyWorkExperienceRepositoryService,
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
        StudentAcademicDetailRepositoryService,
        FacultyRepositoryService,
        FacultyPersonalDetailRepositoryService,
        FacultyContactInformationRepositoryService,
        FacultyAddressRepositoryService,
        FacultyEducationHistoryRepositoryService,
        FacultyEmploymentDetailRepositoryService,
        FacultyWorkExperienceRepositoryService,
    ],
})
export class RepositoryModule { }