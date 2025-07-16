import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from 'src/config/config.service';
import { User, UserSchema } from 'src/schemas/user.schema';

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