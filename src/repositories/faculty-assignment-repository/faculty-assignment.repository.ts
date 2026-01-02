import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { FacultyAssignment, FacultyAssignmentDocument } from 'src/schemas/Exam/facultyAssignments.schema';

@Injectable()
export class FacultyAssignmentRepositoryService {
    constructor(
        @InjectModel(FacultyAssignment.name) private facultyAssignmentModel: Model<FacultyAssignmentDocument>,
    ) { }

    // Create faculty assignment
    async create(
        assignmentData: Partial<FacultyAssignment>,
    ): Promise<FacultyAssignmentDocument> {
        const assignment = new this.facultyAssignmentModel(assignmentData);
        return assignment.save();
    }

    // Find assignments by faculty ID
    async findByFacultyId(facultyId: Types.ObjectId): Promise<FacultyAssignmentDocument[]> {
        return this.facultyAssignmentModel
            .find({ facultyId, isActive: true })
            .exec();
    }

    // Find assignment by exam ID and faculty ID
    async findByExamAndFaculty(
        examId: Types.ObjectId,
        facultyId: Types.ObjectId
    ): Promise<FacultyAssignmentDocument | null> {
        return this.facultyAssignmentModel
            .findOne({ examId, facultyId, isActive: true })
            .exec();
    }

    // Find assignment by exam room ID
    async findByExamRoomId(examRoomId: Types.ObjectId): Promise<FacultyAssignmentDocument | null> {
        return this.facultyAssignmentModel
            .findOne({ examRoomId, isActive: true })
            .exec();
    }
}