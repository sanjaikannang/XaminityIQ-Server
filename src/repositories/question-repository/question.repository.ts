import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Question, QuestionDocument } from "src/schemas/exam/question.schema";
import { Status } from "src/utils/enum";


@Injectable()
export class QuestionRepositoryService {
    constructor(
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>
    ) { }


    // Create a new question
    async create(questionDocument: any): Promise<QuestionDocument> {
        try {

            const question = new this.questionModel(questionDocument);
            return await question.save();

        } catch (error) {
            console.error("Error creating question:", error);
            throw new Error(`Failed to create question: ${error.message}`);
        }

    }


    // Find a question by its ID
    async findByQuestionId(questionId: string): Promise<QuestionDocument | null> {
        try {

            const question = await this.questionModel.findOne({
                questionId,
                status: Status.ACTIVE
            }).exec();
            return question;

        } catch (error) {
            console.error("Error finding question by questionId:", error);
            throw new Error(`Failed to find question: ${error.message}`);
        }
    }

}