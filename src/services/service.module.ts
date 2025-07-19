import { Module } from "@nestjs/common";

// Services
import { AuthService } from "./auth-service/auth.service";
import { JwtService } from "./auth-service/jwt.service";
import { PasswordService } from "./auth-service/password.service";
import { SessionService } from "./auth-service/session.service";
import { AdminService } from "./user-service/admin/admin.service";
import { FacultyService } from "./user-service/faculty/faculty.service";
import { StudentService } from "./user-service/student/student.service";

// Modules
import { ConfigModule } from "src/config/config.module";
import { RepositoryModule } from "src/repositories/repository.module";
import { JwtModule } from "@nestjs/jwt";


@Module({
    imports: [
        RepositoryModule,
        ConfigModule,
        JwtModule.register({})
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