export class SetStudentMicResponse {
    success: boolean;
    message: string;
    data?: {
        // null when the student has no active mic track to mute yet
        muted: boolean | null;
    };
}
