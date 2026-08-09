import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './user/admin/admin.module';
import { FacultyModule } from './user/faculty/faculty.module';
import { StudentModule } from './user/student/student.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    AuthModule,
    AdminModule,
    FacultyModule,
    StudentModule,
    PublicModule
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class ApiModule { }
