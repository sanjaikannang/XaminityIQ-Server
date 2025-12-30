import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FacultyRole } from 'src/utils/enum';

export type FacultyAssignmentDocument = FacultyAssignment & Document;

@Schema({ timestamps: true })
export class FacultyAssignment {

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true })
    facultyId: Types.ObjectId;

    @Prop({
        type: String,
        enum: Object.values(FacultyRole),
        default: FacultyRole.PROCTOR,
    })
    role: FacultyRole;

    @Prop({ default: false })
    hasJoined: boolean;

    @Prop()
    joinedAt?: Date;
}

export const FacultyAssignmentSchema =
    SchemaFactory.createForClass(FacultyAssignment);

// Indexes
FacultyAssignmentSchema.index({ examId: 1, facultyId: 1 }, { unique: true });
FacultyAssignmentSchema.index({ facultyId: 1 });
