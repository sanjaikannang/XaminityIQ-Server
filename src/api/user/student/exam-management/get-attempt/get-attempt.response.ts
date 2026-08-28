import { AttemptQuestionData, AttemptExamSectionData } from '../start-attempt/start-attempt.response';
import { SecuritySettingsInput } from '../../../admin/exam-management/create-exam/create-exam.request';

export class AttemptAnswerData {
    questionId: string;
    selectedOptionId?: string;
    selectedOptionIds?: string[];
    answerText?: string;
    firstViewedAt?: Date;
}

export class GetAttemptData {
    attemptId: string;
    examId: string;
    examName: string;
    durationMinutes: number;
    startedAt: Date;
    status: string;
    remainingMs: number;
    securitySettings: SecuritySettingsInput;
    examSections: AttemptExamSectionData[];
    questions: AttemptQuestionData[];
    answers: AttemptAnswerData[];
}

export class GetAttemptResponse {
    success: boolean;
    message: string;
    data?: GetAttemptData;
}
