import { Document } from "mongoose";
import { RelationType } from "src/utils/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type StudentContactInformationDocument = StudentContactInformation & Document;

@Schema({ _id: false })
export class EmergencyContact {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: Object.values(RelationType) })
    relation: string;

    @Prop({ required: true })
    phoneNumber: string;
}

@Schema({ timestamps: true })
export class StudentContactInformation {
    @Prop({ required: true })
    personalEmail: string;

    @Prop({ required: true, unique: true })
    studentEmail: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop()
    alternatePhoneNumber: string;

    @Prop({ type: EmergencyContact, required: true })
    emergencyContact: EmergencyContact;
}

export const StudentContactInformationSchema = SchemaFactory.createForClass(StudentContactInformation);

StudentContactInformationSchema.index({ studentEmail: 1 });
StudentContactInformationSchema.index({ personalEmail: 1 });