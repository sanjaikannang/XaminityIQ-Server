import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

// Services
import { AuthService } from "./auth-service/auth.service";
import { AuthJwtService } from "./auth-service/jwt.service";
import { PasswordService } from "./auth-service/password.service";
import { AdminService } from "./user-service/admin/admin.service";
import { FacultyService } from "./user-service/faculty/faculty.service";
import { StudentService } from "./user-service/student/student.service";
import { ConfigService } from "src/config/config.service";

// Modules
import { ConfigModule } from "src/config/config.module";
import { RepositoryModule } from "src/repositories/repository.module";

@Module({
    imports: [
        RepositoryModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.getJWTSecretKey(),
                signOptions: { expiresIn: configService.getJWTExpiresIn() },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [],
    providers: [
        AuthService,
        AuthJwtService,
        PasswordService,
        AdminService,
        FacultyService,
        StudentService
    ],
    exports: [
        AuthService,
        PasswordService,
        AuthJwtService,
        AdminService,
        FacultyService,
        StudentService
    ],
})
export class ServiceModule { }