export class RecordingChunkData {
    sequence: number;
    cloudinaryUrl: string;
    uploadedAt: Date;
}

export class RecordingStreamData {
    status: string;
    chunks: RecordingChunkData[];
}

export class AttemptRecordingData {
    attemptId: string;
    examId: string;
    examName: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    studentEmail: string;
    attemptStatus: string;
    // Overall media status on the attempt itself — UPLOAD_COMPLETE only once
    // every stream below has finished (see ExamAttemptService.finalizeRecordingAPI)
    mediaStatus: string;
    video: RecordingStreamData;
    screen: RecordingStreamData;
}

export class GetAttemptRecordingResponse {
    success: boolean;
    message: string;
    data?: AttemptRecordingData;
}
