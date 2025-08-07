import { Status } from "src/utils/enum";

export class BatchData {
    _id: string;
    name: string;
    startYear: number;
    endYear: number;
    createdBy: string;
    status: Status;    
}

export class CreateBatchResponse {

    success: boolean;
    message: string;
    data?: BatchData

}