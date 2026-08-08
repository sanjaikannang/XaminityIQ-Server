import { SubjectData } from 'src/api/user/faculty/subject-management/get-all-subjects/get-all-subjects.response';

export class GetAllSubjectsResponse {
    success: boolean;
    message: string;
    data?: SubjectData[];
}
