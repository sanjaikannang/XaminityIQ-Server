import { SubjectData } from '../get-all-subjects/get-all-subjects.response';

export class GetSubjectResponse {
    success: boolean;
    message: string;
    data?: SubjectData;
}
