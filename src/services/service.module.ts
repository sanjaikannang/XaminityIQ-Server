import { Module } from "@nestjs/common";
import { RepositoryModule } from "src/repositories/repository.module";
import { AuthService } from "./auth-service/auth.service";
import { JwtService } from "./auth-service/jwt.service";
import { PasswordService } from "./auth-service/password.service";
import { SessionService } from "./auth-service/session.service";
import { AdminService } from "./user-service/admin/admin.service";
import { FacultyService } from "./user-service/faculty/faculty.service";
import { StudentService } from "./user-service/student/student.service";

@Module({
    imports: [
        RepositoryModule
    ],
    controllers: [],
    providers: [
        AuthService,
        JwtService,
        PasswordService,
        SessionService,
        AdminService,
        FacultyService,
        StudentService
    ],
    exports: [
        AuthService,
        PasswordService,
        JwtService,
        SessionService,
        AdminService,
        FacultyService,
        StudentService
    ],
})
export class ServiceModule { }