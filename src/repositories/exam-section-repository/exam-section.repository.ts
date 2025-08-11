import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExamSection, ExamSectionDocument } from "src/schemas/exam/exam-section.schema";


@Injectable()
export class ExamSectionRepositoryService {
    constructor(
        @InjectModel(ExamSection.name) private examSectionModel: Model<ExamSectionDocument>
    ) { }


}