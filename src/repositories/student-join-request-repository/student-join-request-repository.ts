import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
    StudentJoinRequest,
    StudentJoinRequestDocument
} from 'src/schemas/Exam/studentJoinRequest.schema';
import { JoinRequestStatus } from 'src/utils/enum';

@Injectable()
export class StudentJoinRequestRepositoryService {
    constructor(
        @InjectModel(StudentJoinRequest.name)
        private readonly studentJoinRequestModel: Model<StudentJoinRequestDocument>,
    ) { }

    // Find pending join requests by exam ID
    async findPendingRequestsByExamId(
        examId: Types.ObjectId
    ): Promise<StudentJoinRequestDocument[]> {
        try {
            return await this.studentJoinRequestModel.find({
                examId,
                status: JoinRequestStatus.PENDING,
                isActive: true
            }).sort({ createdAt: 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException(
                'Error fetching pending join requests'
            );
        }
    }

    // Find join request by ID
    async findById(
        requestId: Types.ObjectId | string
    ): Promise<StudentJoinRequestDocument | null> {
        try {
            return await this.studentJoinRequestModel
                .findById(requestId)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                'Error finding join request'
            );
        }
    }

    // Update join request by ID
    async updateById(
        requestId: Types.ObjectId | string,
        updateData: Partial<StudentJoinRequest>
    ): Promise<StudentJoinRequestDocument | null> {
        try {
            return await this.studentJoinRequestModel.findByIdAndUpdate(
                requestId,
                { $set: updateData },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(
                'Error updating join request'
            );
        }
    }
}
