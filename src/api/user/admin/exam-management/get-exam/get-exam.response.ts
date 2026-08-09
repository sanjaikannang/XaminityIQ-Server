import { ExamData } from '../get-all-exams/get-all-exams.response';
import { QuestionData } from '../add-question/add-question.response';
import { SecuritySettingsInput } from '../create-exam/create-exam.request';

export class ExamDetailData extends ExamData {
    evaluatorFacultyIds: string[];
    securitySettings: SecuritySettingsInput;
    questions: QuestionData[];
    totalQuestionMarks: number;
    matchedStudentCount: number;
}

export class GetExamResponse {
    success: boolean;
    message: string;
    data?: ExamDetailData;
}
