export class CourseData {
    _id: string;
    batchCourseId: string;
    streamCode: string;
    streamName: string;
    courseCode: string;
    courseName: string;
    level: string;
    duration: string;
    semesters: number;
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

export class GetAllCoursesForBatchResponse {
    success: boolean;
    message: string;
    data?: CourseData[];
    pagination?: PaginationMeta;
}