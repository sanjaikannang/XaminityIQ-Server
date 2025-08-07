export class BatchData {
    _id: string;
    name: string;
}

export class GetBatchesResponse {
    success: boolean;
    message: string;
    data?: BatchData[];
}