import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Branch, BranchDocument } from 'src/schemas/hierarchy/branch.schema';


@Injectable()
export class BranchRepositoryService {
    constructor(
        @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
    ) { }


    // Create a new branch
    async create(branchData: Partial<Branch>): Promise<BranchDocument> {
        try {
            const createdBranch = new this.branchModel(branchData);
            return await createdBranch.save();
        } catch (error) {
            console.error("Failed to create branch", error);
            throw new Error('Could not create branch');
        }
    }


    // Find a branch by ID
    async findById(id: string): Promise<BranchDocument | null> {
        try {
            const branch = await this.branchModel.findById(id).exec();
            return branch;
        } catch (error) {
            console.error("Failed to find branch by ID", error);
            throw new Error('Could not find branch');
        }
    }


    // Find One Branch with Filters
    async findOne(filter: FilterQuery<BranchDocument>): Promise<BranchDocument | null> {
        try {

            const branch = await this.branchModel.findOne(filter).exec();
            return branch;

        } catch (error) {
            console.error("Failed to find branch", error);
            throw new Error('Could not find branch');
        }
    }

}