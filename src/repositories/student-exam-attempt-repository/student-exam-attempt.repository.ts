import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StudentExamAttempt, StudentExamAttemptDocument } from "src/schemas/exam/student-exam-attempt.schema";


@Injectable()
export class StudentExamAttemptRepositoryService {
    constructor(
        @InjectModel(StudentExamAttempt.name) private studentExamAttemptModel: Model<StudentExamAttemptDocument>
    ) { }


}