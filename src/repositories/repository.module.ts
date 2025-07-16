import { Module } from "@nestjs/common";
import { AdminRepositoryService } from "./admin-repository/admin.repository";
import { FacultyRepositoryService } from "./faculty-repository/faculty.repository";
import { SessionRepositoryService } from "./session-repository/session.repository";
import { StudentRepositoryService } from "./student-repository/student.repository";
import { UserRepositoryService } from "./user-repository/user.repository";

@Module({
    imports: [],
    controllers: [],
    providers: [
        AdminRepositoryService,
        FacultyRepositoryService,
        SessionRepositoryService,
        StudentRepositoryService,
        UserRepositoryService
    ],
    exports: [
        AdminRepositoryService,
        FacultyRepositoryService,
        SessionRepositoryService,
        StudentRepositoryService,
        UserRepositoryService
    ],
})
export class RepositoryModule { }