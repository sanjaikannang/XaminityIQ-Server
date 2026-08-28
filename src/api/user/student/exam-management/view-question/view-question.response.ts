export class ViewQuestionData {
    firstViewedAt?: Date;
    minTimePerQuestionSeconds: number;
}

export class ViewQuestionResponse {
    success: boolean;
    message: string;
    data?: ViewQuestionData;
}
