import { SecuritySettingsInput } from '../../../admin/exam-management/create-exam/create-exam.request';

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
    // The exam's integrity/anti-malpractice config — the client enforces
    // tab-switch/fullscreen/copy-paste/right-click/backward-nav rules from this
    securitySettings: SecuritySettingsInput;
    questions: AttemptQuestionData[];
}

export class StartAttemptResponse {
    success: boolean;
    message: string;
    data?: StartAttemptData;
}
