import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import { ExamAnswer, ExamAnswerSchema } from 'src/schemas/Exam/examAnswer.schema';
import { ExamQuestion, ExamQuestionSchema } from 'src/schemas/Exam/examQuestion.schema';

// Services
import { ConfigService } from 'src/config/config.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PublicWrittenAnswerService } from 'src/services/public-service/written-answer.service';

// Controllers
import { VerifyQrTokenController } from './written-answer/verify-qr-token/verify-qr-token.controller';
import { GetUploadSignatureController } from './written-answer/get-upload-signature/get-upload-signature.controller';
import { RecordPageController } from './written-answer/record-page/record-page.controller';

// Modules
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ExamAnswer.name, schema: ExamAnswerSchema },
            { name: ExamQuestion.name, schema: ExamQuestionSchema },
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
        VerifyQrTokenController,
        GetUploadSignatureController,
        RecordPageController,
    ],
    providers: [
        ConfigService,
        AuthJwtService,
        CloudinaryService,
        PublicWrittenAnswerService,
    ],
    exports: [],
})
export class PublicModule { }
