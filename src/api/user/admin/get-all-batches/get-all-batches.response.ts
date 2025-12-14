export class BatchData {
    _id: string;
    batchName: string;
    startYear: number;
    endYear: number;
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

export class GetAllBatchesResponse {
    success: boolean;
    message: string;
    data?: BatchData[];
    pagination?: PaginationMeta;
}