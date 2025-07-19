import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Country, Gender, MaritalStatus, Nationality, Status } from 'src/utils/enum';

export type FacultyDocument = Faculty & Document;

@Schema({ timestamps: true })
export class Faculty {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: String, required: true, unique: true }) // e.g., FAC001
    facultyId: string;

    @Prop({
        type: {
            photo: { type: String },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            dateOfBirth: { type: Date },
            gender: { type: String, enum: Gender },
            nationality: { type: String, default: Nationality.INDIAN },
            religion: { type: String },
            maritalStatus: { type: String, enum: MaritalStatus },
        },
    })
    personalInfo: {
        photo?: string;
        firstName: string;
        lastName: string;
        dateOfBirth?: Date;
        gender?: Gender;
        nationality?: string;
        religion?: string;
        maritalStatus?: MaritalStatus
    };

    @Prop({
        type: {
            phone: { type: String, required: true },
            permanentAddress: {
                street: { type: String },
                city: { type: String },
                state: { type: String },
                zipCode: { type: String },
                country: { type: String, default: Country.INDIA },
            },
            currentAddress: {
                street: { type: String },
                city: { type: String },
                state: { type: String },
                zipCode: { type: String },
                country: { type: String, default: Country.INDIA },
            },
        },
    })
    contactInfo: {
        phone: string;
        permanentAddress?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
        };
        currentAddress?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
        };
    };

    @Prop({
        type: {
            employeeId: { type: String },
            department: { type: String, required: true },
            designation: { type: String, required: true },
            qualification: [
                {
                    degree: { type: String },
                    institution: { type: String },
                    year: { type: Number },
                    percentage: { type: Number },
                },
            ],
            experience: {
                totalYears: { type: Number },
                previousInstitutions: [
                    {
                        institutionName: { type: String },
                        designation: { type: String },
                        duration: { type: String },
                        from: { type: Date },
                        to: { type: Date },
                    },
                ],
            },
        },
    })
    professionalInfo: {
        employeeId?: string;
        department: string;
        designation: string;
        qualification?: Array<{
            degree?: string;
            institution?: string;
            year?: number;
            percentage?: number;
        }>;
        experience?: {
            totalYears?: number;
            previousInstitutions?: Array<{
                institutionName?: string;
                designation?: string;
                duration?: string;
                from?: Date;
                to?: Date;
            }>;
        };
    }

    @Prop({ type: Date, default: Date.now })
    joiningDate: Date;

    @Prop({ type: String, enum: Status, default: Status.ACTIVE })
    status: Status;

}  

export const FacultySchema = SchemaFactory.createForClass(Faculty);

// Define indexes
FacultySchema.index({ userId: 1 });
// FacultySchema.index({ facultyId: 1 });
FacultySchema.index({ status: 1 });
FacultySchema.index({ 'professionalInfo.department': 1 });