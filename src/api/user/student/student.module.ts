import { Module } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';

@Module({
    imports: [],
    controllers: [],
    providers: [
        ConfigService,
    ],
    exports: [
        ConfigService,
    ],
})
export class StudentModule { }