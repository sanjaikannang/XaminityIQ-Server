export default class BranchesData {
    _id: string;
    name: string;
    code: string;
    courseId: string;
    status: string;
}

export class GetBranchesResponse {

    success: boolean;
    message: string;
    data?: BranchesData[];

}