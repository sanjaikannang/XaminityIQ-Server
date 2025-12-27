import { Document, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type StudentParentDetailDocument = StudentParentDetail & Document;

@Schema({ _id: false })
export class ParentInfo {
    @Prop()
    name: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    email: string;

    @Prop()
    occupation: string;
}

@Schema({ _id: false })
export class GuardianInfo {
    @Prop()
    name: string;

    @Prop()
    relation: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    email: string;

    @Prop()
    occupation: string;
}

@Schema({ timestamps: true })
export class StudentParentDetail {
    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ type: ParentInfo })
    father: ParentInfo;

    @Prop({ type: ParentInfo })
    mother: ParentInfo;

    @Prop({ type: GuardianInfo })
    guardian: GuardianInfo;
}

export const StudentParentDetailSchema = SchemaFactory.createForClass(StudentParentDetail);

StudentParentDetailSchema.index({ studentId: 1 });