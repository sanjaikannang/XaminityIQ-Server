import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Exam, ExamDocument } from "src/schemas/exam/exam.schema";
import { Status } from "src/utils/enum";


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


}