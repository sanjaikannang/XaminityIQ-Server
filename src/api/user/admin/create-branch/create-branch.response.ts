export class BranchData {
    _id: string;
    name: string;
    code: string;
    courseId: string;
    createdBy: string;
    status: string;
}

export class CreateBranchResponse {

    success: boolean;
    message: string;
    data?: BranchData;
    
}