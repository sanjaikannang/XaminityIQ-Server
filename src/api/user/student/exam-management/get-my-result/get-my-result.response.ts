export class ResultAnswerPageData {
    pageNumber: number;
    cloudinaryUrl: string;
    uploadedAt: Date;
}

export class ResultQuestionData {
    questionId: string;
    type: string;
    text: string;
    maxMarks: number;
    marksObtained: number;
    remarks?: string;
    pages?: ResultAnswerPageData[];
}

export class MyResultData {
    examName: string;
    totalMarks: number;
    passingMarks: number;
    objectiveScore?: number;
    writtenScore?: number;
    totalScore?: number;
    passed?: boolean;
    questions: ResultQuestionData[];
}

export class GetMyResultResponse {
    success: boolean;
    message: string;
    data?: MyResultData;
}
