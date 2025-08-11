import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Exam, ExamDocument } from "src/schemas/exam/exam.schema";


@Injectable()
export class ExamRepositoryService {
    constructor(
        @InjectModel(Exam.name) private examModel: Model<ExamDocument>
    ) { }


    // Create a new exam
    async create(examData: string) {

    }


    // Find an exam by its ID
    async findByExamId(examId: string) {

    }


}