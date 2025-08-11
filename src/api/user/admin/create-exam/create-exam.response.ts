export class ExamData {
    examId: string;
    examTitle: string;
    examStatus: string;
    totalMarks: number;
    duration: number;
}
export class CreateExamResponse {

    success: boolean;
    message: string;
    data?: ExamData;

}