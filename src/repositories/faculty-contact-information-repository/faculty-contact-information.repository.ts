import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FacultyContactInformation, FacultyContactInformationDocument } from 'src/schemas/User/Faculty/facultyContactInformation.schema';

@Injectable()
export class FacultyContactInformationRepositoryService {
    constructor(
        @InjectModel(FacultyContactInformation.name) private facultyContactInformationModel: Model<FacultyContactInformationDocument>
    ) { }

    async create(data: Partial<FacultyContactInformation>, session?: ClientSession): Promise<FacultyContactInformationDocument> {
        try {
            const contact = new this.facultyContactInformationModel(data);
            return await contact.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findById(id: Types.ObjectId): Promise<FacultyContactInformationDocument | null> {
        try {
            return await this.facultyContactInformationModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByPersonalEmail(email: string): Promise<FacultyContactInformationDocument | null> {
        try {
            return await this.facultyContactInformationModel.findOne({ personalEmail: email }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByFacultyEmail(email: string): Promise<FacultyContactInformationDocument | null> {
        try {
            return await this.facultyContactInformationModel.findOne({ facultyEmail: email }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByPhoneNumber(phoneNumber: string): Promise<FacultyContactInformationDocument | null> {
        try {
            return await this.facultyContactInformationModel.findOne({ phoneNumber }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}