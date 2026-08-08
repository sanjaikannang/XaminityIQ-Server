import { Document, Types } from 'mongoose';
import { MediaStatus } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamRecordingDocument = ExamRecording & Document;

@Schema({ _id: false })
export class RecordingChunk {

    @Prop({ required: true })
    sequence: number;

    @Prop({ required: true })
    cloudinaryAssetId: string;

    @Prop({ required: true })
    cloudinaryUrl: string;

    @Prop({ required: true })
    uploadedAt: Date;

}

@Schema({ _id: false })
export class RecordingStream {

    @Prop({ required: true, enum: Object.values(MediaStatus), default: MediaStatus.PENDING_UPLOAD })
    status: string;

    @Prop({ type: [RecordingChunk], default: [] })
    chunks: RecordingChunk[];

}

@Schema({ collection: 'exam_recordings', timestamps: true })
export class ExamRecording {

    @Prop({ type: Types.ObjectId, ref: 'ExamAttempt', required: true })
    attemptId: Types.ObjectId;

    @Prop({ type: RecordingStream, default: () => ({}) })
    video: RecordingStream;

    @Prop({ type: RecordingStream, default: () => ({}) })
    audio: RecordingStream;

    @Prop({ type: RecordingStream, default: () => ({}) })
    screen: RecordingStream;

}

export const ExamRecordingSchema = SchemaFactory.createForClass(ExamRecording);

ExamRecordingSchema.index({ attemptId: 1 }, { unique: true });
