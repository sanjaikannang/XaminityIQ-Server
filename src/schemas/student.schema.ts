import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Country, Gender, Nationality, Status } from 'src/utils/enum';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: String, required: true, unique: true }) // e.g., STU001
    studentId: string;

    @Prop({ type: String, required: true, unique: true })
    rollNumber: string;

    @Prop({
        type: {
            photo: { type: String },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            dateOfBirth: { type: Date, required: true },
            gender: { type: String, enum: Gender, required: true },
            nationality: { type: String, default: Nationality.INDIAN },
            religion: { type: String },
        },
    })
    personalInfo: {
        photo?: string;
        firstName: string;
        lastName: string;
        dateOfBirth: Date;
        gender: Gender;
        nationality?: string;
        religion?: string;
    };

    @Prop({
        type: {
            phone: { type: String },
            permanentAddress: {
                street: { type: String, required: true },
                city: { type: String, required: true },
                state: { type: String, required: true },
                zipCode: { type: String, required: true },
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
        phone?: string;
        permanentAddress: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
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
            father: {
                name: { type: String, required: true },
                occupation: { type: String },
                phone: { type: String },
                email: { type: String },
            },
            mother: {
                name: { type: String, required: true },
                occupation: { type: String },
                phone: { type: String },
                email: { type: String },
            },
            guardian: {
                name: { type: String },
                relationship: { type: String },
                phone: { type: String },
                email: { type: String },
            },
        },
    })
    familyInfo: {
        father: {
            name: string;
            occupation?: string;
            phone?: string;
            email?: string;
        };
        mother: {
            name: string;
            occupation?: string;
            phone?: string;
            email?: string;
        };
        guardian?: {
            name?: string;
            relationship?: string;
            phone?: string;
            email?: string;
        };
    };

    @Prop({
        type: {
            course: { type: String, required: true },
            branch: { type: String, required: true },
            semester: { type: Number, required: true },
            section: { type: String },
            batch: { type: String, required: true },
            admissionYear: { type: Number, required: true },
            expectedGraduationYear: { type: Number },
        },
    })
    academicInfo: {
        course: string;
        branch: string;
        semester: number;
        section?: string;
        batch: string;
        admissionYear: number;
        expectedGraduationYear?: number;
    };

    @Prop({
        type: String,
        enum: Status,
        default: Status.ACTIVE,
    })
    status: Status;

}

export const StudentSchema = SchemaFactory.createForClass(Student);

// Define indexes
StudentSchema.index({ userId: 1 });
// StudentSchema.index({ studentId: 1 });
// StudentSchema.index({ rollNumber: 1 });
StudentSchema.index({ "academicInfo.course": 1, "academicInfo.branch": 1 });
StudentSchema.index({ "academicInfo.batch": 1 });
StudentSchema.index({ status: 1 });
