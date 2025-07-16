export class CreateStudentResponse {

    success: boolean;
    message: string;
    data?: {
        user: {
            id: string;
            email: string;
            role: string;
        };
        student: {
            id: string;
            studentId: string;
            rollNumber: string;
            personalInfo: any;
            contactInfo: any;
            familyInfo: any;
            academicInfo: any;
        };
        defaultPassword: string;
    };

}
