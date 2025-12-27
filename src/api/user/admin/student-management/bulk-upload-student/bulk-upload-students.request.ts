import { Type } from 'class-transformer';
import {
    IsArray, ValidateNested, ArrayMaxSize, ArrayMinSize
} from 'class-validator';
import { CreateStudentRequest } from '../create-student/create-student.request';

export class BulkUploadStudentsRequest {

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateStudentRequest)
    @ArrayMinSize(1, { message: 'At least one student record is required' })
    @ArrayMaxSize(100, { message: 'Maximum 100 students can be uploaded at once' })
    students: CreateStudentRequest[];

}