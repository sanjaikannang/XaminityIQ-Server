import { Model } from 'mongoose';
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

}