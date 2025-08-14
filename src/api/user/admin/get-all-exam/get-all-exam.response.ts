export class ExamResponse {

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
        faculty: ExamResponse[];
        pagination: PaginationInfo;
    };
}