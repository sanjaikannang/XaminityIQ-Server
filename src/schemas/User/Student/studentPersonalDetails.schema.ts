import { Gender, Nationality } from "src/utils/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type StudentPersonalDetailDocument = StudentPersonalDetail & Document;

@Schema({ timestamps: true })
export class StudentPersonalDetail {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true, enum: Object.values(Gender) })
    gender: Gender;

    @Prop({ required: true })
    dateOfBirth: Date;

    @Prop({ required: true })
    profilePhotoUrl: string;

    @Prop({ required: true, default: Nationality.INDIAN })
    nationality: string;

    @Prop()
    religion: string;
}

export const StudentPersonalDetailSchema = SchemaFactory.createForClass(StudentPersonalDetail);