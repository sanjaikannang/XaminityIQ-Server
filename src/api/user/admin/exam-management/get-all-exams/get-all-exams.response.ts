export class ExamData {
    _id: string;
    name: string;
    description?: string;
    mode: string;
    status: string;
    batchId: string;
    batchName: string;
    courseId: string;
    courseName: string;
    departmentId: string;
    deptName: string;
    sectionId: string;
    sectionName: string;
    semester: number;
    subjectId: string;
    subjectName: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    startDate: Date;
    endDate: Date;
    startTime?: string;
    endTime?: string;
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
