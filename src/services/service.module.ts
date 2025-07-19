import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "@nestjs-modules/ioredis";

// Services
import { AuthService } from "./auth-service/auth.service";
import { AuthJwtService } from "./auth-service/jwt.service";
import { PasswordService } from "./auth-service/password.service";
import { SessionService } from "./auth-service/session.service";
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
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                type: 'single',
                url: `redis://:${configService.getRedisPassword()}@${configService.getRedisHost()}:${configService.getRedisPort()}`,
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [],
    providers: [
        AuthService,
        AuthJwtService,
        PasswordService,
        SessionService,
        AdminService,
        FacultyService,
        StudentService
    ],
    exports: [
        AuthService,
        PasswordService,
        AuthJwtService,
        SessionService,
        AdminService,
        FacultyService,
        StudentService
    ],
})
export class ServiceModule { }