import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MediaStatus, RecordingMediaType } from 'src/utils/enum';
import { ExamRecording, ExamRecordingDocument } from 'src/schemas/Exam/examRecording.schema';

@Injectable()
export class ExamRecordingRepositoryService {
    constructor(
        @InjectModel(ExamRecording.name) private examRecordingModel: Model<ExamRecordingDocument>,
    ) { }


    // Seed the empty video/audio/screen stubs when an attempt starts
    async create(attemptId: Types.ObjectId): Promise<ExamRecordingDocument> {
        try {
            const recording = new this.examRecordingModel({ attemptId });
            return await recording.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find the recording doc for an attempt
    async findByAttemptId(attemptId: string): Promise<ExamRecordingDocument | null> {
        try {
            return await this.examRecordingModel
                .findOne({ attemptId: new Types.ObjectId(attemptId) })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Atomically append a chunk to the given stream and mark it UPLOADING
    async appendChunk(
        attemptId: string,
        mediaType: RecordingMediaType,
        chunk: { sequence: number; cloudinaryAssetId: string; cloudinaryUrl: string; uploadedAt: Date },
    ): Promise<ExamRecordingDocument | null> {
        try {
            return await this.examRecordingModel
                .findOneAndUpdate(
                    { attemptId: new Types.ObjectId(attemptId) },
                    {
                        $push: { [`${mediaType}.chunks`]: chunk },
                        $set: { [`${mediaType}.status`]: MediaStatus.UPLOADING },
                    },
                    { new: true },
                )
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Mark a stream fully uploaded
    async markStreamComplete(attemptId: string, mediaType: RecordingMediaType): Promise<ExamRecordingDocument | null> {
        try {
            return await this.examRecordingModel
                .findOneAndUpdate(
                    { attemptId: new Types.ObjectId(attemptId) },
                    { $set: { [`${mediaType}.status`]: MediaStatus.UPLOAD_COMPLETE } },
                    { new: true },
                )
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}
