export class RemoveStudentResponse {

    success: boolean;
    message: string;
    data: {
        studentId: string;
        reason: string;
    };

}
