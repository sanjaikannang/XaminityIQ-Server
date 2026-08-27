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


    // Find a room by its LiveKit session/room name — used by the LiveKit
    // webhook to map an incoming event's room.name back to our own room doc
    async findByLiveKitSessionId(liveKitSessionId: string): Promise<ExamRoomDocument | null> {
        try {
            return await this.examRoomModel.findOne({ liveKitSessionId }).exec();
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


    // The stored `status` field is set once at room formation and never
    // transitions afterwards — nothing in this codebase moves a room to
    // ACTIVE/CLOSED. For the admin overview page, "real-time" status is
    // derived from the room's own schedule instead: this filter expresses
    // that same UPCOMING/IN_PROGRESS/COMPLETED bucketing as a Mongo query
    // against startDateTime/endDateTime, so it can be pushed to the DB
    // rather than fetching every room to filter in memory.
    private buildEffectiveStatusFilter(effectiveStatus?: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED'): any {
        const now = new Date();
        if (effectiveStatus === 'UPCOMING') return { startDateTime: { $gt: now } };
        if (effectiveStatus === 'IN_PROGRESS') return { startDateTime: { $lte: now }, endDateTime: { $gt: now } };
        if (effectiveStatus === 'COMPLETED') return { endDateTime: { $lte: now } };
        return {};
    }


    // Count rooms across all exams, optionally bucketed by real-time status
    async countAllRooms(effectiveStatus?: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED'): Promise<number> {
        try {
            return await this.examRoomModel.countDocuments(this.buildEffectiveStatusFilter(effectiveStatus)).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find rooms across all exams, optionally bucketed by real-time status —
    // the admin "Exam Room Allocation" overview page's data source
    async findAllRooms(
        effectiveStatus: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | undefined,
        skip: number,
        limit: number,
    ): Promise<ExamRoomDocument[]> {
        try {
            return await this.examRoomModel
                .find(this.buildEffectiveStatusFilter(effectiveStatus))
                .sort({ startDateTime: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}
