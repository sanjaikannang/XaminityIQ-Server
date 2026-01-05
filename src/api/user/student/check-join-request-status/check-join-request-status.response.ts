import { JoinRequestStatus } from 'src/utils/enum';

export class CheckJoinRequestStatusData {
    status: JoinRequestStatus;
    isRejoin: boolean;
    approvedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
}

export class CheckJoinRequestStatusResponse {
    success: boolean;
    message: string;
    data: CheckJoinRequestStatusData;
}
