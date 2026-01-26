import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StudentActionType } from 'src/utils/enum';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StudentAction, StudentActionDocument } from 'src/schemas/Exam/studentAction.schema';

@Injectable()
export class StudentActionRepositoryService {
    constructor(
        @InjectModel(StudentAction.name)
        private studentActionModel: Model<StudentActionDocument>,
    ) { }

    async create(actionData: {
        examId: Types.ObjectId;
        studentId: Types.ObjectId;
        action: StudentActionType;
        reason?: string;
    }): Promise<StudentActionDocument> {
        try {
            const studentAction = new this.studentActionModel(actionData);
            return studentAction.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByExam(examId: string): Promise<StudentActionDocument[]> {
        try {
            return this.studentActionModel.find({
                examId: new Types.ObjectId(examId)
            })
                .populate('studentId', 'name email')
                .sort({ timestamp: 1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByStudent(
        examId: string,
        studentId: string
    ): Promise<StudentActionDocument[]> {
        try {
            return this.studentActionModel.find({
                examId: new Types.ObjectId(examId),
                studentId: new Types.ObjectId(studentId)
            })
                .sort({ timestamp: 1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}
