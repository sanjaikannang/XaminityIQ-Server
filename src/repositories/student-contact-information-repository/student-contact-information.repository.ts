import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StudentContactInformation, StudentContactInformationDocument } from 'src/schemas/User/Student/studentContactInformation.schema';

@Injectable()
export class StudentContactInformationRepositoryService {
    constructor(
        @InjectModel(StudentContactInformation.name) private studentContactInformationModel: Model<StudentContactInformationDocument>
    ) { }


    // Create student contact information
    async create(
        data: Partial<StudentContactInformation>,
        session?: ClientSession
    ): Promise<StudentContactInformationDocument> {
        try {
            const contact = new this.studentContactInformationModel(data);
            return await contact.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find contact information by MongoDB ObjectId
    async findById(id: Types.ObjectId): Promise<StudentContactInformationDocument | null> {
        try {
            return await this.studentContactInformationModel
                .findById(id)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find contact information using personal email address
    async findByPersonalEmail(email: string): Promise<StudentContactInformationDocument | null> {
        try {
            return await this.studentContactInformationModel
                .findOne({ personalEmail: email })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find contact information using student email address
    async findByStudentEmail(email: string): Promise<StudentContactInformationDocument | null> {
        try {
            return await this.studentContactInformationModel
                .findOne({ studentEmail: email })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


}