import { Module } from "@nestjs/common";
import { RepositoryModule } from "src/repositories/repository.module";
import { AuthService } from "./auth-service/auth.service";
import { JwtService } from "./auth-service/jwt.service";
import { PasswordService } from "./auth-service/password.service";
import { SessionService } from "./auth-service/session.service";

@Module({
    imports: [
        RepositoryModule
    ],
    controllers: [],
    providers: [
        AuthService,
        JwtService,
        PasswordService,
        SessionService
    ],
    exports: [
        AuthService,
        PasswordService,
        JwtService,
        SessionService
    ],
})
export class ServiceModule { }