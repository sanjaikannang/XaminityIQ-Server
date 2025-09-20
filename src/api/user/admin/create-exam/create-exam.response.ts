export class ExamData {
    examId: string;
    examTitle: string;
    totalMarks: number;
    duration: number;
}
export class CreateExamResponse {

    success: boolean;
    message: string;
    data?: ExamData;

}