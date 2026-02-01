import { ExamMode, ExamStatus } from "src/utils/enum";

export class ExamData {
    _id: string;
    examName: string;
    examMode: ExamMode;
    examDate?: string;
    startTime?: string;
    endTime?: string;
    examStartDate?: string;
    examEndDate?: string;
    duration: number;
    status: ExamStatus;
    totalStudents: number;
    facultyName?: string;
    createdAt: Date;
}

export class PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class GetAllExamsResponse {
    success: boolean;
    message: string;
    data?: ExamData[];
    pagination?: PaginationMeta;
}