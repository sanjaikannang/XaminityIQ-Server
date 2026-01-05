export class JoinRequestItem {

    requestId: string;
    studentId: string;
    studentName: string;
    isRejoin: boolean;
    createdAt: Date;

}

export class GetJoinRequestsResponse {

    success: boolean;
    message: string;
    data: JoinRequestItem[];

}
