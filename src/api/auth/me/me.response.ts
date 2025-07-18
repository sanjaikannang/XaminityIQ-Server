import { UserRole } from "src/utils/enum";

export class MeResponse {

    success: boolean;
    message: string;
    data?: {
        user: {
            id: string;
            email: string;
            role: UserRole;
            isFirstLogin: boolean;
            lastLogin: Date;
        };
        profile: any;
    };

}