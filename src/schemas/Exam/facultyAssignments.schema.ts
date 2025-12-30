import { Document, Types } from 'mongoose';
import { AssignmentStatus } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FacultyAssignmentDocument = FacultyAssignment & Document;

@Schema({ timestamps: true })
export class FacultyAssignment {
    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true })
    facultyId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ExamRoom', required: true })
    examRoomId: Types.ObjectId;

    @Prop({
        required: true,
        enum: Object.values(AssignmentStatus),
        default: AssignmentStatus.ASSIGNED
    })
    status: AssignmentStatus;

    @Prop({ required: true, default: Date.now })
    assignedAt: Date;

    @Prop()
    joinedAt: Date;

    @Prop()
    leftAt: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const FacultyAssignmentSchema = SchemaFactory.createForClass(FacultyAssignment);

// Indexes
FacultyAssignmentSchema.index({ examId: 1, facultyId: 1 });
FacultyAssignmentSchema.index({ examRoomId: 1 }, { unique: true }); // One faculty per room
FacultyAssignmentSchema.index({ status: 1 });