import { UserRole } from "src/utils/enum";

export class LoginResponse {

    success: boolean;
    message: string;
    data?: {
        user: {
            id: string;
            email: string;
            role: UserRole;
            isFirstLogin: boolean;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    };
    
}