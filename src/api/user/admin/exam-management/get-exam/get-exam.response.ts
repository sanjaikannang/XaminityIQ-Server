import { ExamData } from '../get-all-exams/get-all-exams.response';
import { QuestionData } from '../add-question/add-question.response';
import { SecuritySettingsInput } from '../create-exam/create-exam.request';

export class ExamSectionData {
    _id: string;
    label: string;
    order: number;
}

export class ExamDetailData extends ExamData {
    evaluatorFacultyIds: string[];
    securitySettings: SecuritySettingsInput;
    examSections: ExamSectionData[];
    questions: QuestionData[];
    totalQuestionMarks: number;
    matchedStudentCount: number;
}

export class GetExamResponse {
    success: boolean;
    message: string;
    data?: ExamDetailData;
}
