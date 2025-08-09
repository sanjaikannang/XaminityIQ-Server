export class SectionData {
    _id: string;
    name: string;
    branchId: string;
    capacity?: number;
    status: string;
}

export class GetSectionsByBranchResponse {

    success: boolean;
    message: string;
    data?: SectionData[];

}