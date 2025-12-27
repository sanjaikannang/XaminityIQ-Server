export class StudentUploadResult {
    rowNumber: number;
    studentId?: string;
    studentEmail?: string;
    status: 'success' | 'failed';
    error?: string;
}

export class BulkUploadSummary {
    totalRecords: number;
    successCount: number;
    failedCount: number;
    successfulUploads: StudentUploadResult[];
    failedUploads: StudentUploadResult[];
}

export class BulkUploadStudentsResponse {
    success: boolean;
    message: string;
    summary: BulkUploadSummary;
}