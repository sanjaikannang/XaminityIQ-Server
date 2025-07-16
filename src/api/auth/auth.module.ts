import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from 'src/config/config.service';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { Faculty, FacultySchema } from 'src/schemas/faculty.schema';
import { Session, SessionSchema } from 'src/schemas/session.schema';
import { Student, StudentSchema } from 'src/schemas/student.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Session.name, schema: SessionSchema },
            { name: Faculty.name, schema: FacultySchema },
            { name: Student.name, schema: StudentSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
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