export class CreateFacultyResponse {

    success: boolean;
    message: string;
    data?: {
        user: {
            id: string;
            email: string;
            role: string;
        };
        faculty: {
            id: string;
            facultyId: string;
            personalInfo: any;
            contactInfo: any;
            professionalInfo: any;
        };
        defaultPassword: string;
    };

}