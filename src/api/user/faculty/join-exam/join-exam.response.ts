export class JoinExamResponse {

    success: boolean;
    message: string;
    data: {
        roomId: string;
        authToken: string;
        examName: string;
        totalStudents: number;
    };

}