import { Document } from "mongoose";
import { Gender, MaritalStatus, Nationality } from "src/utils/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type FacultyPersonalDetailDocument = FacultyPersonalDetail & Document;

@Schema({ timestamps: true })
export class FacultyPersonalDetail {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true, enum: Object.values(Gender) })
    gender: Gender;

    @Prop({ required: true })
    dateOfBirth: string;

    @Prop({ required: true, enum: Object.values(MaritalStatus) })
    maritalStatus: string;

    @Prop({ required: true })
    profilePhotoUrl: string;

    @Prop({ required: true, default: Nationality.INDIAN })
    nationality: string;

    @Prop()
    religion: string;
}

export const FacultyPersonalDetailSchema = SchemaFactory.createForClass(FacultyPersonalDetail);