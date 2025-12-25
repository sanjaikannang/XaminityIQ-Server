import { Gender, MaritalStatus } from "src/utils/enum";
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
    dateOfBirth: Date;

    @Prop({ required: true, enum: Object.values(MaritalStatus) })
    maritalStatus: string;

    @Prop({ required: true })
    profilePhotoUrl: string;

    @Prop()
    nationality: string;

    @Prop()
    bloodGroup: string;
}

export const FacultyPersonalDetailSchema = SchemaFactory.createForClass(FacultyPersonalDetail);
