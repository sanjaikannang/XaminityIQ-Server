import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExamRoom, ExamRoomDocument } from 'src/schemas/Exam/examRoom.schema';

@Injectable()
export class ExamRoomRepositoryService {
    constructor(
        @InjectModel(ExamRoom.name) private examRoomModel: Model<ExamRoomDocument>,
    ) { }


    // Create multiple exam rooms at once (room formation)
    async createMany(data: Partial<ExamRoom>[]): Promise<ExamRoomDocument[]> {
        try {
            return await this.examRoomModel.insertMany(data) as unknown as ExamRoomDocument[];
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find an exam room by id
    async findById(id: string | Types.ObjectId): Promise<ExamRoomDocument | null> {
        try {
            return await this.examRoomModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find all rooms belonging to an exam
    async findByExamId(examId: string | Types.ObjectId): Promise<ExamRoomDocument[]> {
        try {
            return await this.examRoomModel.find({ examId: new Types.ObjectId(examId) }).sort({ createdAt: 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find all rooms a given faculty is invigilating
    async findByFacultyId(facultyId: string | Types.ObjectId): Promise<ExamRoomDocument[]> {
        try {
            return await this.examRoomModel.find({ facultyId: new Types.ObjectId(facultyId) }).sort({ startDateTime: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Batch-fetch rooms by id — used when locating an exam's rooms via its
    // assignments' distinct roomIds (a pooled room's own examId may be unset)
    async findByIds(roomIds: Types.ObjectId[]): Promise<ExamRoomDocument[]> {
        try {
            return await this.examRoomModel.find({ _id: { $in: roomIds } }).sort({ createdAt: 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}
