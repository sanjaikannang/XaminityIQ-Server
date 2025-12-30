import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExamRoom, ExamRoomDocument } from 'src/schemas/Exam/examRooms.schema';

@Injectable()
export class ExamRoomRepositoryService {
    constructor(
        @InjectModel(ExamRoom.name) private examRoomModel: Model<ExamRoomDocument>,
    ) { }

    // Create exam room
    async create(data: Partial<ExamRoom>): Promise<ExamRoom & { _id: Types.ObjectId }> {
        const created = await this.examRoomModel.create(data);
        return created.toObject() as ExamRoom & { _id: Types.ObjectId };
    }

}