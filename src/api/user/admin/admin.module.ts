import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Schemas
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { Faculty, FacultySchema } from 'src/schemas/faculty.schema';
import { Session, SessionSchema } from 'src/schemas/session.schema';
import { Student, StudentSchema } from 'src/schemas/student.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

// Services
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { JwtService } from 'src/services/auth-service/jwt.service';
import { PasswordService } from 'src/services/auth-service/password.service';
import { SessionService } from 'src/services/auth-service/session.service';

// Controllers
import { CreateFacultyController } from './create-faculty/create-faculty.controller';
import { CreateStudentController } from './create-student/create-student.controller';

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
    controllers: [
        CreateFacultyController,
        CreateStudentController
    ],
    providers: [
        ConfigService,
        AuthService,
        JwtService,
        SessionService,
        PasswordService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
        AuthService,
        JwtService,
        SessionService,
        JwtAuthGuard,
        RoleGuard,
    ],
})
export class AdminModule { }