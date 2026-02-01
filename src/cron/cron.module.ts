import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RepositoryModule } from 'src/repositories/repository.module';

@Global()
@Module({
    imports: [
        ScheduleModule.forRoot(),
        RepositoryModule
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class CronModule { }
