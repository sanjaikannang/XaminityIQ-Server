import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FacultyAddress, FacultyAddressDocument } from 'src/schemas/User/Faculty/facultyAddressDetail.schema';

@Injectable()
export class FacultyAddressRepositoryService {
    constructor(
        @InjectModel(FacultyAddress.name) private facultyAddressModel: Model<FacultyAddressDocument>
    ) { }

    async create(data: Partial<FacultyAddress>, session?: ClientSession): Promise<FacultyAddressDocument> {
        try {
            const address = new this.facultyAddressModel(data);
            return await address.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findById(id: Types.ObjectId): Promise<FacultyAddressDocument | null> {
        try {
            return await this.facultyAddressModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}