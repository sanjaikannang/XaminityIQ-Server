import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Schemas
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

// Services
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';
import { PasswordService } from 'src/services/auth-service/password.service';

// Controllers

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getJWTSecretKey(),
                signOptions: {
                    expiresIn: configService.getJWTExpiresIn(),
                },
            }),
        }),
        ServiceModule,
        RepositoryModule
    ],
    controllers: [
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
export class AdminModule { }