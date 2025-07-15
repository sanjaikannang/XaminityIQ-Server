import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from 'src/config/config.service';

@Module({
    imports: [
        MongooseModule.forFeature(),
    ],
    controllers: [],
    providers: [
        ConfigService,
    ],
    exports: [
        ConfigService,
    ],
})
export class AuthModule { }