export class AttemptQuestionOption {
    optionId: string;
    text: string;
}

export class AttemptQuestionData {
    _id: string;
    type: string;
    text: string;
    marks: number;
    order: number;
    options?: AttemptQuestionOption[];
}

export class StartAttemptData {
    attemptId: string;
    examId: string;
    examName: string;
    durationMinutes: number;
    startedAt: Date;
    questions: AttemptQuestionData[];
}

export class StartAttemptResponse {
    success: boolean;
    message: string;
    data?: StartAttemptData;
}
