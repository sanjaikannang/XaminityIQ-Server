import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { Section, SectionDocument } from 'src/schemas/hierarchy/section.schema';
import { Status } from 'src/utils/enum';


@Injectable()
export class SectionRepositoryService {
    constructor(
        @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    ) { }


    // Create a new section
    async create(sectionData: Partial<Section>): Promise<SectionDocument> {
        try {

            const createdSection = new this.sectionModel(sectionData);
            return await createdSection.save();

        } catch (error) {
            console.error("Failed to create section", error);
            throw new Error('Could not create section');
        }
    }


    // Find One Section with Filters
    async findOne(filter: FilterQuery<SectionDocument>): Promise<SectionDocument | null> {
        try {
            // Convert string ObjectIds to actual ObjectIds if needed
            const processedFilter = { ...filter };

            const section = await this.sectionModel.findOne(processedFilter).exec();

            return section;

        } catch (error) {
            console.error("Failed to find section", error);
            throw new Error('Could not find section');
        }
    }


    // Find section by ID
    async findById(id: string): Promise<SectionDocument | null> {
        try {

            const section = await this.sectionModel.findById(id).exec();
            return section;

        } catch (error) {
            console.error("Failed to find section by ID", error);
            throw new Error('Could not find section');
        }
    }


    // Find Section by Branch ID
    async findByBranchId(branchId: string): Promise<SectionDocument[]> {
        try {

            const section = await this.sectionModel
                .find({
                    branchId: new Types.ObjectId(branchId),
                    status: Status.ACTIVE
                })
                .select('_id name branchId capacity status')
                .lean()
                .exec();

            return section;

        } catch (error) {
            console.error("Failed to find section by ID", error);
            throw new Error('Could not find section');
        }
    }


    // Get All Sections
    async getAllSection(): Promise<SectionDocument[]> {
        try {
            const sections = await this.sectionModel
                .find({ status: Status.ACTIVE })
                .select('_id name branchId capacity status')
                .lean()
                .exec();

            return sections;

        } catch (error) {
            console.error("Failed to get all sections", error);
            throw new Error('Could not get all sections');
        }
    }

}