export class UserActivityRecord {
    action: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

export class GetStudentActivityResponse {
    success: boolean;
    message: string;
    data?: UserActivityRecord[];
}
