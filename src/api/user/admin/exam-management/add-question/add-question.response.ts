export class QuestionOptionData {
    optionId: string;
    text: string;
}

export class QuestionData {
    _id: string;
    type: string;
    text: string;
    marks: number;
    order: number;
    examSectionId?: string;
    options?: QuestionOptionData[];
    correctOptionIds?: string[];
    createdAt: Date;
}

export class AddQuestionResponse {
    success: boolean;
    message: string;
    data?: QuestionData;
}
