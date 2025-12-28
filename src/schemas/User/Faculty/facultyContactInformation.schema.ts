import { Document } from "mongoose";
import { RelationType } from "src/utils/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type FacultyContactInformationDocument = FacultyContactInformation & Document;

@Schema({ _id: false })
export class FacultyEmergencyContact {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: Object.values(RelationType) })
    relation: string;

    @Prop({ required: true })
    phoneNumber: string;
}

@Schema({ timestamps: true })
export class FacultyContactInformation {
    @Prop({ required: true })
    personalEmail: string;

    @Prop({ required: true, unique: true })
    facultyEmail: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop()
    alternatePhoneNumber: string;

    @Prop({ type: FacultyEmergencyContact, required: true })
    emergencyContact: FacultyEmergencyContact;
}

export const FacultyContactInformationSchema = SchemaFactory.createForClass(FacultyContactInformation);

FacultyContactInformationSchema.index({ facultyEmail: 1 });
FacultyContactInformationSchema.index({ personalEmail: 1 });