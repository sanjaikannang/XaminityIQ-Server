import { Global, Module } from '@nestjs/common';
import { ExamStatusUpdaterService } from './exam-status-updater.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';

@Global()
@Module({
    imports: [
        ScheduleModule.forRoot(),
        ExamRepositoryService
    ],
    controllers: [],
    providers: [
        ExamStatusUpdaterService
    ],
    exports: [
        ExamStatusUpdaterService
    ],
})
export class CronModule { }
