import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Question, QuestionDocument } from "src/schemas/exam/question.schema";


@Injectable()
export class QuestionRepositoryService {
    constructor(
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>
    ) { }


}