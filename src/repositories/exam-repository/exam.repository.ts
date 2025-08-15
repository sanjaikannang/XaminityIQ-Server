import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Exam, ExamDocument } from "src/schemas/exam/exam.schema";
import { Status } from "src/utils/enum";

export interface FacultyAssignedExamsResult {
    exams: any[];
    totalCount: number;
}


@Injectable()
export class ExamRepositoryService {
    constructor(
        @InjectModel(Exam.name) private examModel: Model<ExamDocument>
    ) { }


    // Create a new exam
    async create(examData: any): Promise<ExamDocument> {
        try {

            const exam = new this.examModel(examData);
            return await exam.save();

        } catch (error) {
            console.error("Error creating exam:", error);
            throw new Error(`Failed to create exam: ${error.message}`);
        }
    }


    // Find an exam by its ID
    async findByExamId(examId: string): Promise<ExamDocument | null> {
        try {

            const exam = await this.examModel.findOne({ examId, status: Status.ACTIVE }).exec();
            return exam;

        } catch (error) {
            console.error("Error finding exam by examId:", error);
            throw new Error(`Failed to find exam: ${error.message}`);
        }
    }


    // Count documents
    async countDocuments(filter: any): Promise<number> {
        try {

            const count = await this.examModel.countDocuments(filter).exec();
            return count;

        } catch (error) {
            console.error("Error finding exam count:", error);
            throw new Error(`Failed to find exam count: ${error.message}`);
        }
    }


    // Find exams with pagination
    async findWithPagination(
        filter: any,
        skip: number,
        limit: number,
        sort: any = {}
    ): Promise<ExamDocument[]> {
        return this.examModel
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();
    }


    // Find exams with specific fields
    async findOne(filter: any): Promise<ExamDocument | null> {
        try {

            const exam = await this.examModel.findOne(filter).exec();
            return exam;

        } catch (error) {
            console.error("Error finding exam:", error);
            throw new Error(`Failed to find exam: ${error.message}`);
        }
    }


    // Find all exams with optional filter
    async findAll(filter: any = {}, sort: any = {}): Promise<ExamDocument[]> {
        try {

            const exam = await this.examModel.find(filter).sort(sort).exec();
            return exam;

        } catch (error) {
            console.error("Error finding exam:", error);
            throw new Error(`Failed to find exam: ${error.message}`);
        }
    }


    // Get exams assigned to a faculty
    async getFacultyAssignedExams(facultyId: string): Promise<FacultyAssignedExamsResult> {
        try {
            // Convert facultyId string to ObjectId
            const facultyObjectId = new Types.ObjectId(facultyId);

            // Find exams where the faculty is assigned and exam is active
            const assignedExams = await this.examModel
                .find({
                    assignedFacultyIds: { $in: [facultyObjectId] },
                    status: Status.ACTIVE
                })
                .populate('batchId', 'batchName batchCode') // Populate batch info if needed
                .populate('courseId', 'courseName courseCode') // Populate course info if needed
                .populate('branchId', 'branchName branchCode') // Populate branch info if needed
                .populate('sectionIds', 'sectionName sectionCode') // Populate section info if needed
                .populate('createdBy', 'email') // Populate creator info if needed
                .select('-__v') // Exclude version field
                .sort({ createdAt: -1 }) // Sort by creation date, newest first
                .lean(); // Return plain JavaScript objects for better performance

            return {
                exams: assignedExams,
                totalCount: assignedExams.length
            };

        } catch (error) {
            console.error("Error finding assigned exam to faculty:", error);
            throw new Error(`Failed to find assigned exam to faculty exam: ${error.message}`);
        }
    }
    
}