import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import { Admin, AdminSchema } from 'src/schemas/User/Admin/admin.schema';
import { User, UserSchema } from 'src/schemas/User/user.schema';

// Services
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';
import { PasswordService } from 'src/services/auth-service/password.service';

// Controllers
import { LoginController } from './login/login.controller';
import { LogoutController } from './logout/logout.controller';
import { RefreshTokenController } from './refresh-token/refresh-token.controller';
import { ChangePasswordController } from './change-password/change-password.controller';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Modules
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
        RepositoryModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getJWTSecretKey(),
                signOptions: {
                    expiresIn: configService.getJWTExpiresIn(),
                },
            }),
        }),
    ],
    controllers: [
        LoginController,
        LogoutController,
        RefreshTokenController,
        ChangePasswordController,
    ],
    providers: [
        ConfigService,
        AuthService,
        AuthJwtService,        
        PasswordService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
        AuthService,
        AuthJwtService,        
        JwtAuthGuard,
        RoleGuard,
    ],
})
export class AuthModule { }