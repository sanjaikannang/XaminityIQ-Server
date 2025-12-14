export class SectionData {
    _id: string;
    sectionName: string;
    capacity: number;
    currentStrength: number;
    createdAt: Date;
}

export class DepartmentData {
    _id: string;
    batchDepartmentId: string;
    deptCode: string;
    deptName: string;
    totalSeats: number;
    sectionCapacity: number;
    sections: SectionData[];
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

export class GetAllDepartmentForBatchCourseResponse {
    success: boolean;
    message: string;
    data?: DepartmentData[];
    pagination?: PaginationMeta;
}