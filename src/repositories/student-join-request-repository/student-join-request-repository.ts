import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StudentJoinRequest, StudentJoinRequestDocument } from 'src/schemas/Exam/studentJoinRequest.schema';

@Injectable()
export class StudentJoinRequestRepositoryService {
    constructor(
        @InjectModel(StudentJoinRequest.name) private studentJoinRequestModel: Model<StudentJoinRequestDocument>,
    ) { }

    async findByExamIdAndStudentId() {
        try {
        } catch (error) {
            throw new InternalServerErrorException('');
        }
    }

}