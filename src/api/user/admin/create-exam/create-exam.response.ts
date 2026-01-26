export class CreateExamResponse {

    success: boolean;
    message: string;
    data?: {
        examId: string;
        examName: string;
        channelName: string;
        participantsCount: number;
    };

}