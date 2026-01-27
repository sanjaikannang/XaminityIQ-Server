import { Model, Types } from 'mongoose';
import { ExamStatus } from 'src/utils/enum';
import { InjectModel } from '@nestjs/mongoose';
import { Exam, ExamDocument } from 'src/schemas/Exam/exam.schema';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ExamRepositoryService {
    constructor(
        @InjectModel(Exam.name) private examModel: Model<ExamDocument>
    ) { }

    async findById(examId: string): Promise<ExamDocument | null> {
        try {
            return this.examModel.findById(examId).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async create(examData: {
        examMode: string;
        examName: string;
        date: Date;
        time: string;
        duration: number;
        agoraChannelName: string;
        createdBy: Types.ObjectId;
    }): Promise<ExamDocument> {
        try {
            const exam = new this.examModel(examData);
            return exam.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateStatus(examId: string, status: ExamStatus): Promise<ExamDocument | null> {
        try {
            return this.examModel.findByIdAndUpdate(
                examId,
                { status },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateStartTime(examId: string, startedAt: Date): Promise<ExamDocument | null> {
        try {
            return this.examModel.findByIdAndUpdate(
                examId,
                { startedAt, status: ExamStatus.ONGOING },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateEndTime(examId: string, endedAt: Date): Promise<ExamDocument | null> {
        try {
            return this.examModel.findByIdAndUpdate(
                examId,
                { endedAt, status: ExamStatus.COMPLETED },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByFaculty(facultyId: string, status?: ExamStatus): Promise<ExamDocument[]> {
        try {
            const filter: any = { createdBy: new Types.ObjectId(facultyId) };
            if (status) {
                filter.status = status;
            }
            return this.examModel.find(filter).sort({ date: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}