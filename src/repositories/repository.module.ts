import { Module } from "@nestjs/common";
import { AdminRepositoryService } from "./admin-repository/admin.repository";
import { FacultyRepositoryService } from "./faculty-repository/faculty.repository";
import { SessionRepositoryService } from "./session-repository/session.repository";
import { StudentRepositoryService } from "./student-repository/student.repository";
import { UserRepositoryService } from "./user-repository/user.repository";
import { MongooseModule } from "@nestjs/mongoose";

// Schemas
import { Admin, AdminSchema } from "src/schemas/admin.schema";
import { Faculty, FacultySchema } from "src/schemas/faculty.schema";
import { Session, SessionSchema } from "src/schemas/session.schema";
import { Student, StudentSchema } from "src/schemas/student.schema";
import { User, UserSchema } from "src/schemas/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: Faculty.name, schema: FacultySchema },
            { name: Session.name, schema: SessionSchema },
            { name: Student.name, schema: StudentSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
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