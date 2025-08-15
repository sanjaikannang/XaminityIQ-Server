import { ExamResponse } from "../get-all-exam/get-all-exam.response";

export class ExamSectionResponse {
    _id: string;
    sectionName: string;
    sectionOrder: number;
    sectionMarks: number;
    questionType: string;
    totalQuestions: number;
    sectionInstructions: string[];
    isOptional: boolean;
    questions: QuestionResponse[];
}

export class QuestionResponse {
    _id: string;
    questionId: string;
    questionText: string;
    questionImage?: string;
    questionType: string;
    marks: number;
    questionOrder: number;
    difficultyLevel: string;
    options?: Array<{
        optionText: string;
        optionImage?: string;
        isCorrect: boolean;
    }>;
    correctAnswers?: Array<{
        answerText: string;
        keywords: string[];
        marks: number;
    }>;
    correctAnswer?: boolean;
    explanation?: string;
}

export class DetailedExamResponse extends ExamResponse {
    sections: ExamSectionResponse[];
    totalSections: number;
    totalQuestions: number;
}

export class GetExamByIdResponse {

    success: boolean;
    message: string;
    data?: DetailedExamResponse;

}