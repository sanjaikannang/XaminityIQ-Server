import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

    // Find enrollments by student ID
    async findByStudentId(studentId: Types.ObjectId): Promise<StudentEnrollmentDocument[]> {
        return this.studentEnrollmentModel
            .find({ studentId, isActive: true })
            .exec();
    }

    // Find enrollment by exam ID and student ID
    async findByExamAndStudent(
        examId: Types.ObjectId,
        studentId: Types.ObjectId
    ): Promise<StudentEnrollmentDocument | null> {
        return this.studentEnrollmentModel
            .findOne({ examId, studentId, isActive: true })
            .exec();
    }

    // Count enrolled students by exam ID
    async countByExamId(examId: Types.ObjectId): Promise<number> {
        return this.studentEnrollmentModel
            .countDocuments({ examId, isActive: true })
            .exec();
    }

    // Find enrollments by exam room ID
    async findByExamRoomId(examRoomId: Types.ObjectId): Promise<StudentEnrollmentDocument[]> {
        return this.studentEnrollmentModel
            .find({ examRoomId, isActive: true })
            .exec();
    }

    async findByExamIdAndStudentId(
        examId: Types.ObjectId,
        studentId: Types.ObjectId
    ) {
        try {
            return await this.studentEnrollmentModel.findOne({
                examId: examId,
                studentId: studentId
            })
        } catch (error) {
            throw new InternalServerErrorException(
                'Error finding student enrollment'
            );
        }
    }

    async updateById(
        enrollmentId: Types.ObjectId | string,
        updateData: Partial<StudentEnrollment>
    ): Promise<StudentEnrollmentDocument | null> {
        try {
            return await this.studentEnrollmentModel.findByIdAndUpdate(
                enrollmentId,
                { $set: updateData },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(
                'Error updating student enrollment'
            );
        }
    }

}