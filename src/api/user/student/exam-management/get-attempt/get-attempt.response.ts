import { AttemptQuestionData } from '../start-attempt/start-attempt.response';

export class AttemptAnswerData {
    questionId: string;
    selectedOptionId?: string;
    selectedOptionIds?: string[];
}

export class GetAttemptData {
    attemptId: string;
    examId: string;
    examName: string;
    durationMinutes: number;
    startedAt: Date;
    status: string;
    remainingMs: number;
    questions: AttemptQuestionData[];
    answers: AttemptAnswerData[];
}

export class GetAttemptResponse {
    success: boolean;
    message: string;
    data?: GetAttemptData;
}
