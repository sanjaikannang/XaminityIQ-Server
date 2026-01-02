import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Exam, ExamDocument } from 'src/schemas/Exam/exam.schema';

@Injectable()
export class ExamRepositoryService {
    constructor(
        @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    ) { }

    // Create exam
    async create(examData: Partial<Exam>): Promise<ExamDocument> {
        const exam = new this.examModel(examData);
        return exam.save();
    }

    // Find exams by IDs
    async findByIds(examIds: Types.ObjectId[]): Promise<ExamDocument[]> {
        return this.examModel
            .find({ _id: { $in: examIds }, isActive: true })
            .exec();
    }

    // Find exam by ID
    async findById(examId: Types.ObjectId): Promise<ExamDocument | null> {
        return this.examModel
            .findOne({ _id: examId, isActive: true })
            .exec();
    }

}