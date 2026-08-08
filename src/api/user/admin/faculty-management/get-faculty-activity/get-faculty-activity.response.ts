export class UserActivityRecord {
    action: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

export class GetFacultyActivityResponse {
    success: boolean;
    message: string;
    data?: UserActivityRecord[];
}
