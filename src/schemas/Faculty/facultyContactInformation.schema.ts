import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type FacultyContactInformationDocument = FacultyContactInformation & Document;

@Schema({ _id: false })
export class FacultyEmergencyContact {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    relation: string;

    @Prop({ required: true })
    phoneNumber: string;
}

@Schema({ timestamps: true })
export class FacultyContactInformation {
    @Prop({ required: true })
    personalEmail: string;

    @Prop({ required: true, unique: true })
    facultyEmail: string; // Auto-generated @college.edu

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