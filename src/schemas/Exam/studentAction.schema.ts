import { Document, Types } from 'mongoose';
import { StudentActionType } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type StudentActionDocument = StudentAction & Document;

@Schema({ timestamps: true })
export class StudentAction {

    @Prop({ required: true, type: Types.ObjectId, ref: 'Exam' })
    examId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Student' })
    studentId: Types.ObjectId;

    @Prop({
        required: true,
        enum: StudentActionType
    })
    action: StudentActionType;

    @Prop({ type: String })
    reason: string;

    @Prop({ required: true, type: Date, default: Date.now })
    timestamp: Date;

}

export const StudentActionSchema = SchemaFactory.createForClass(StudentAction);

StudentActionSchema.index({ examId: 1, studentId: 1, timestamp: 1 });
