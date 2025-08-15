import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExamSection, ExamSectionDocument } from "src/schemas/exam/exam-section.schema";


@Injectable()
export class ExamSectionRepositoryService {
    constructor(
        @InjectModel(ExamSection.name) private examSectionModel: Model<ExamSectionDocument>
    ) { }


    // Create a new exam section
    async create(examSectionData: any): Promise<ExamSectionDocument> {
        try {

            const examSection = new this.examSectionModel(examSectionData);
            return await examSection.save();

        } catch (error) {
            console.error("Error creating exam section:", error);
            throw new Error(`Failed to create exam section: ${error.message}`);
        }
    }


    // Find all exam
    async findAll(filter: any = {}, sort: any = {}): Promise<ExamSectionDocument[]> {
        try {

            const sections = await this.examSectionModel.find(filter).sort(sort).exec();
            return sections;

        } catch (error) {
            console.error("Error find exam section:", error);
            throw new Error(`Failed to find exam section: ${error.message}`);
        }
    }


    // Find one exam section by filter
    async findOne(filter: any): Promise<ExamSectionDocument | null> {
        try {

            const sections = this.examSectionModel.findOne(filter).exec();
            return sections;

        } catch (error) {
            console.error("Error find exam section:", error);
            throw new Error(`Failed to find exam section: ${error.message}`);
        }
    }


}