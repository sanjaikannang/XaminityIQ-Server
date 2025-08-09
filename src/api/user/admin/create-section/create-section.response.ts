export class SectionData {
    _id: string;
    name: string;
    branchId: string;
    capacity?: number;
    createdBy: string;
    status: string;
}

export class CreateSectionResponse {

    success: boolean;
    message: string;
    data?: SectionData;

}