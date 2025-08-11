import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminRepositoryService } from "./admin-repository/admin.repository";
import { FacultyRepositoryService } from "./faculty-repository/faculty.repository";
import { SessionRepositoryService } from "./session-repository/session.repository";
import { StudentRepositoryService } from "./student-repository/student.repository";
import { UserRepositoryService } from "./user-repository/user.repository";
import { BatchRepositoryService } from "./batch-repository/batch-repository";
import { CourseRepositoryService } from "./course-repository/course-repository";
import { BranchRepositoryService } from "./branch-repository/branch-repository";
import { SectionRepositoryService } from "./section-repository/section-repository";
import { ExamRepositoryService } from "./exam-repository/exam.repository";
import { QuestionRepositoryService } from "./question-repository/question.repository";
import { ExamSectionRepositoryService } from "./exam-section-repository/exam-section.repository";
import { StudentExamAttemptRepositoryService } from "./student-exam-attempt-repository/student-exam-attempt.repository";


// Schemas
import { Admin, AdminSchema } from "src/schemas/admin.schema";
import { Faculty, FacultySchema } from "src/schemas/faculty.schema";
import { Session, SessionSchema } from "src/schemas/session.schema";
import { Student, StudentSchema } from "src/schemas/student.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { Batch, BatchSchema } from "src/schemas/hierarchy/batch.schema";
import { Course, CourseSchema } from "src/schemas/hierarchy/course.schema";
import { Branch, BranchSchema } from "src/schemas/hierarchy/branch.schema";
import { Section, SectionSchema } from "src/schemas/hierarchy/section.schema";
import { Exam, ExamSchema } from "src/schemas/exam/exam.schema";
import { Question, QuestionSchema } from "src/schemas/exam/question.schema";
import { ExamSection, ExamSectionSchema } from "src/schemas/exam/exam-section.schema";
import { StudentExamAttempt, StudentExamAttemptSchema } from "src/schemas/exam/student-exam-attempt.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: Faculty.name, schema: FacultySchema },
            { name: Session.name, schema: SessionSchema },
            { name: Student.name, schema: StudentSchema },
            { name: User.name, schema: UserSchema },
            { name: Batch.name, schema: BatchSchema },
            { name: Course.name, schema: CourseSchema },
            { name: Branch.name, schema: BranchSchema },
            { name: Section.name, schema: SectionSchema },
            { name: Exam.name, schema: ExamSchema },
            { name: Question.name, schema: QuestionSchema },
            { name: ExamSection.name, schema: ExamSectionSchema },
            { name: StudentExamAttempt.name, schema: StudentExamAttemptSchema },
        ]),
    ],
    controllers: [],
    providers: [
        AdminRepositoryService,
        FacultyRepositoryService,
        SessionRepositoryService,
        StudentRepositoryService,
        UserRepositoryService,
        BatchRepositoryService,
        CourseRepositoryService,
        BranchRepositoryService,
        SectionRepositoryService,
        ExamRepositoryService,
        QuestionRepositoryService,
        ExamSectionRepositoryService,
        StudentExamAttemptRepositoryService
    ],
    exports: [
        AdminRepositoryService,
        FacultyRepositoryService,
        SessionRepositoryService,
        StudentRepositoryService,
        UserRepositoryService,
        BatchRepositoryService,
        CourseRepositoryService,
        BranchRepositoryService,
        SectionRepositoryService,
        ExamRepositoryService,
        QuestionRepositoryService,
        ExamSectionRepositoryService,
        StudentExamAttemptRepositoryService
    ],
})
export class RepositoryModule { }