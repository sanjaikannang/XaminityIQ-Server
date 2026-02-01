import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RepositoryModule } from 'src/repositories/repository.module';
import { ExamStatusUpdaterService } from './exam-status-updater.service';

@Global()
@Module({
    imports: [
        ScheduleModule.forRoot(),
        RepositoryModule
    ],
    controllers: [],
    providers: [
        ExamStatusUpdaterService
    ],
    exports: [],
})
export class CronModule { }
