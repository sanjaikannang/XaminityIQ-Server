export class SubjectData {
    _id: string;
    subjectCode: string;
    subjectName: string;
    semester: number;
    credits: number;
    subjectType: string;
    description?: string;
    deptId: string;
    deptCode: string;
    deptName: string;
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

export class GetAllSubjectsResponse {
    success: boolean;
    message: string;
    data?: SubjectData[];
    pagination?: PaginationMeta;
}
