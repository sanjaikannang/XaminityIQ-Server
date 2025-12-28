import { Document, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type FacultyWorkExperienceDocument = FacultyWorkExperience & Document;

@Schema({ timestamps: true })
export class FacultyWorkExperience {
    @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true })
    facultyId: Types.ObjectId;

    @Prop({ required: true })
    organization: string;

    @Prop({ required: true })
    role: string;

    @Prop()
    department: string;

    @Prop({ required: true })
    fromDate: string;

    @Prop({ required: true })
    toDate: string;

    @Prop({ required: true })
    experienceYears: number;

    @Prop()
    jobDescription: string;

    @Prop()
    reasonForLeaving: string;

    @Prop({ default: false })
    isCurrent: boolean;
}

export const FacultyWorkExperienceSchema = SchemaFactory.createForClass(FacultyWorkExperience);

FacultyWorkExperienceSchema.index({ facultyId: 1 });
FacultyWorkExperienceSchema.index({ facultyId: 1, isCurrent: 1 });