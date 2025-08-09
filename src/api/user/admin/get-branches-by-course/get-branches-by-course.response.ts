export default class BranchesData {
    _id: string;
    name: string;
    code: string;
    courseId: string;
    status: string;
}

export class GetBranchesByCourseResponse {

    success: boolean;
    message: string;
    data?: BranchesData[];

}