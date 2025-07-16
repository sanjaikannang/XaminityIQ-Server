import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { Faculty, FacultySchema } from 'src/schemas/faculty.schema';
import { Session, SessionSchema } from 'src/schemas/session.schema';
import { Student, StudentSchema } from 'src/schemas/student.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

// Services
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { JwtService } from 'src/services/auth-service/jwt.service';
import { SessionService } from 'src/services/auth-service/session.service';
import { PasswordService } from 'src/services/auth-service/password.service';

// Controllers
import { LoginController } from './login/login.controller';
import { LogoutController } from './logout/logout.controller';
import { RefreshTokenController } from './refresh-token/refresh-token.controller';
import { ChangePasswordController } from './change-password/change-password.controller';
import { ResetPasswordController } from './reset-password/reset-password.controller';
import { MeController } from './me/me.controller';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Session.name, schema: SessionSchema },
            { name: Faculty.name, schema: FacultySchema },
            { name: Student.name, schema: StudentSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
    ],
    controllers: [
        LoginController,
        LogoutController,
        RefreshTokenController,
        ChangePasswordController,
        ResetPasswordController,
        MeController,
    ],
    providers: [
        ConfigService,
        AuthService,
        JwtService,
        SessionService,
        PasswordService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
        AuthService,
        JwtService,
        SessionService,
        JwtAuthGuard,
        RoleGuard,
    ],
})
export class AuthModule { }