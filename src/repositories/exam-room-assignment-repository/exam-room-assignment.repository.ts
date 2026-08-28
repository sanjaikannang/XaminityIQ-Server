import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RoomAssignmentStatus } from 'src/utils/enum';
import { ExamRoomAssignment, ExamRoomAssignmentDocument } from 'src/schemas/Exam/examRoomAssignment.schema';

@Injectable()
export class ExamRoomAssignmentRepositoryService {
    constructor(
        @InjectModel(ExamRoomAssignment.name) private examRoomAssignmentModel: Model<ExamRoomAssignmentDocument>,
    ) { }


    // Create multiple assignments at once (room formation)
    async createMany(data: Partial<ExamRoomAssignment>[]): Promise<ExamRoomAssignmentDocument[]> {
        try {
            return await this.examRoomAssignmentModel.insertMany(data) as unknown as ExamRoomAssignmentDocument[];
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find an assignment by id
    async findById(id: string | Types.ObjectId): Promise<ExamRoomAssignmentDocument | null> {
        try {
            return await this.examRoomAssignmentModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find all assignments for a room
    async findByRoomId(roomId: string | Types.ObjectId): Promise<ExamRoomAssignmentDocument[]> {
        try {
            return await this.examRoomAssignmentModel.find({ roomId: new Types.ObjectId(roomId) }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find a specific student's assignment within a room
    async findByRoomAndStudent(roomId: string | Types.ObjectId, studentId: string | Types.ObjectId): Promise<ExamRoomAssignmentDocument | null> {
        try {
            return await this.examRoomAssignmentModel.findOne({
                roomId: new Types.ObjectId(roomId),
                studentId: new Types.ObjectId(studentId),
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find an assignment scoped to a room (ownership-check helper for faculty actions)
    async findByRoomAndId(roomId: string | Types.ObjectId, assignmentId: string | Types.ObjectId): Promise<ExamRoomAssignmentDocument | null> {
        try {
            return await this.examRoomAssignmentModel.findOne({
                _id: new Types.ObjectId(assignmentId),
                roomId: new Types.ObjectId(roomId),
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find a student's assignment for a given exam (any room)
    async findByExamAndStudent(examId: string | Types.ObjectId, studentId: string | Types.ObjectId): Promise<ExamRoomAssignmentDocument | null> {
        try {
            return await this.examRoomAssignmentModel.findOne({
                examId: new Types.ObjectId(examId),
                studentId: new Types.ObjectId(studentId),
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Update an assignment by id
    async updateById(id: string | Types.ObjectId, data: Partial<ExamRoomAssignment>): Promise<ExamRoomAssignmentDocument | null> {
        try {
            return await this.examRoomAssignmentModel.findByIdAndUpdate(id, data, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Every currently-mid-disconnect assignment (ADMITTED/IN_PROGRESS with
    // disconnectedAt set) — the LiveKitDisconnectSweepService's scan target
    async findDisconnected(): Promise<ExamRoomAssignmentDocument[]> {
        try {
            return await this.examRoomAssignmentModel.find({
                status: { $in: [RoomAssignmentStatus.ADMITTED, RoomAssignmentStatus.IN_PROGRESS] },
                disconnectedAt: { $ne: null },
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find every assignment for an exam, across whatever room(s) it landed in —
    // used for the "rooms already formed" guard and to locate an exam's rooms
    // now that a room's own examId may be unset for a pooled room
    async findByExamId(examId: string | Types.ObjectId): Promise<ExamRoomAssignmentDocument[]> {
        try {
            return await this.examRoomAssignmentModel.find({ examId: new Types.ObjectId(examId) }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}
