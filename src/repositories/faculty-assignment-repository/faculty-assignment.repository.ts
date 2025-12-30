import { Model } from 'mongoose';
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

}