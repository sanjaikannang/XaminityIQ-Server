import { Module } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { RepositoryModule } from 'src/repositories/repository.module';
import { StudentModule } from 'src/api/user/student/student.module';
import { LiveKitWebhookService } from './livekit-webhook.service';
import { LiveKitWebhookController } from './livekit-webhook.controller';
import { LiveKitDisconnectSweepService } from './livekit-disconnect-sweep.service';

@Module({
    imports: [
        RepositoryModule,
        StudentModule, // for ExamAttemptService (finalizeAttemptByFaculty)
    ],
    controllers: [
        LiveKitWebhookController,
    ],
    providers: [
        ConfigService,
        LiveKitWebhookService,
        LiveKitDisconnectSweepService,
    ],
    exports: [],
})
export class LiveKitModule { }
