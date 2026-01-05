import { JoinRequestStatus } from 'src/utils/enum';

export class RequestJoinExamResponse {
    success: boolean;
    message: string;
    data: {
        requestId: string;
        status: JoinRequestStatus;
        isRejoin?: boolean;
    };
}
