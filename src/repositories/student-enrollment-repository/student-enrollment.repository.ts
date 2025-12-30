import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { StudentEnrollment, StudentEnrollmentDocument } from 'src/schemas/Exam/studentEnrollments.schema';

@Injectable()
export class StudentEnrollmentRepositoryService {
    constructor(
        @InjectModel(StudentEnrollment.name) private studentEnrollmentModel: Model<StudentEnrollmentDocument>,
    ) { }

    // Create multiple enrollments
    async createMany(
        enrollmentsData: Omit<StudentEnrollment, '_id'>[],
    ): Promise<StudentEnrollmentDocument[]> {
        return this.studentEnrollmentModel.insertMany(enrollmentsData);
    }

}