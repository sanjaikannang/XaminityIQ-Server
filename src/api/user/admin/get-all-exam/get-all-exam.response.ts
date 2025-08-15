export class ExamResponse {
    examId: string;
    examTitle: string;
    examDescription?: string;
    subject: string;
    totalMarks: number;
    passingMarks: number;
    duration: number;
    examMode: string;
    generalInstructions: string[];
    examStatus: string;

    // Target Audience
    batchId: string;
    courseId: string;
    branchId: string;
    sectionIds: string[];

    // Schedule Details
    scheduleDetails: {
        examDate?: Date;
        startTime?: string;
        endTime?: string;
        startDate?: Date;
        endDate?: Date;
        bufferTime: {
            beforeExam: number;
            afterExam: number;
        };
    };

    // Faculty Assignment
    assignedFacultyIds: string[];
    createdBy: string;
    status: string;    
}

export class PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class GetAllExamResponse {
    success: boolean;
    message: string;
    data: {
        pagination: PaginationInfo;
        exams: ExamResponse[];        
    };
}