export class AttemptAnswerPageData {
    pageNumber: number;
    cloudinaryUrl: string;
    uploadedAt: Date;
}

export class AttemptQuestionAnswerData {
    questionId: string;
    type: string;
    text: string;
    marks: number;
    order: number;
    examSectionId?: string;
    selectedOptionText?: string;
    selectedOptionTexts?: string[];
    isCorrect?: boolean;
    pages?: AttemptAnswerPageData[];
    answerText?: string;
    marksAwarded?: number;
    remarks?: string;
}

export class GetAttemptAnswersResponse {
    success: boolean;
    message: string;
    data?: AttemptQuestionAnswerData[];
}
