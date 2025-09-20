import { ExamMode, Status } from "src/utils/enum";

export interface FacultyExamData {
    _id: string;
    examId: string;
    examTitle: string;
    examDescription?: string;
    subject: string;
    totalMarks: number;
    passingMarks: number;
    duration: number;
    examMode: ExamMode;
    generalInstructions: string[];
    batchId: {
        _id: string;
        batchName?: string;
        batchCode?: string;
    };
    courseId: {
        _id: string;
        courseName?: string;
        courseCode?: string;
    };
    branchId: {
        _id: string;
        branchName?: string;
        branchCode?: string;
    };
    sectionIds: Array<{
        _id: string;
        sectionName?: string;
        sectionCode?: string;
    }>;
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
    assignedFacultyIds: string[];
    createdBy: {
        _id: string;
        email?: string;
    };
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

export class GetExamResponse {
    success: boolean;
    message: string;
    data?: {
        exams: FacultyExamData[];
        totalCount: number;
    };
}