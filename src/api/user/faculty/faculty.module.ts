import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/config/config.service';
import { RepositoryModule } from 'src/repositories/repository.module';
import { ServiceModule } from 'src/services/service.module';
import { GetExamController } from './get-exam/get-exam.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Faculty, FacultySchema } from 'src/schemas/faculty.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Faculty.name, schema: FacultySchema },
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
        GetExamController
    ],
    providers: [
        ConfigService,
    ],
    exports: [
        ConfigService,
    ],
})
export class FacultyModule { }