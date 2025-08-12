import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { DifficultyLevel, ExamMode, QuestionType } from "src/utils/enum";

export class BufferTime {
    @IsOptional()
    @IsNumber()
    @Min(0)
    beforeExam: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    afterExam: number;
}

export class ScheduleDetails {

    // For PROCTORING mode
    @IsOptional()
    @IsDateString()
    examDate?: string;

    @IsOptional()
    @IsString()
    startTime?: string;

    @IsOptional()
    @IsString()
    endTime?: string;

    // For AUTO mode
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    // Buffer time
    @IsOptional()
    @ValidateNested()
    @Type(() => BufferTime)
    bufferTime?: BufferTime;

}

export class QuestionOption {

    @IsString()
    optionText: string;

    @IsOptional()
    @IsString()
    optionImage?: string;

    @IsBoolean()
    isCorrect: boolean;

}

export class CorrectAnswer {

    @IsString()
    answerText: string;

    @IsArray()
    @IsString({ each: true })
    keywords: string[];

    @IsNumber()
    @Min(0)
    marks: number;

}

export class CreateQuestion {

    @IsString()
    questionText: string;

    @IsOptional()
    @IsString()
    questionImage?: string;

    @IsEnum(QuestionType)
    questionType: QuestionType;

    @IsNumber()
    @Min(0)
    marks: number;

    @IsNumber()
    @Min(1)
    questionOrder: number;

    @IsEnum(DifficultyLevel)
    difficultyLevel: DifficultyLevel;

    // For MCQ questions
    @IsOptional()
    @IsArray()
    @Type(() => QuestionOption)
    options?: QuestionOption[];

    // For Short/Long answer questions
    @IsOptional()
    @IsArray()
    @Type(() => CorrectAnswer)
    correctAnswers?: CorrectAnswer[];

    // For True/False questions
    @IsOptional()
    @IsBoolean()
    correctAnswer?: boolean;

    @IsOptional()
    @IsString()
    explanation?: string;

}

// DTO for Exam Sections
export class CreateExamSection {

    @IsString()
    sectionName: string;

    @IsNumber()
    @Min(1)
    sectionOrder: number;

    @IsNumber()
    @Min(0)
    sectionMarks: number;

    @IsEnum(QuestionType)
    questionType: QuestionType;

    @IsNumber()
    @Min(1)
    totalQuestions: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sectionInstructions?: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    timeLimit?: number;

    @IsOptional()
    @IsBoolean()
    isOptional?: boolean;

    @IsArray()
    @Type(() => CreateQuestion)
    questions: CreateQuestion[];

}

export class CreateExamRequest {

    // Basic Exam Info    
    @IsString()
    examTitle: string;

    @IsOptional()
    @IsString()
    examDescription?: string;

    @IsString()
    subject: string;

    @IsNumber()
    @Min(1)
    totalMarks: number;

    @IsNumber()
    @Min(0)
    passingMarks: number;

    @IsNumber()
    @Min(1)
    duration: number;

    @IsEnum({ example: ExamMode.AUTO, enum: ExamMode })
    examMode: ExamMode;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    generalInstructions?: string[];

    // Target Audience
    @IsString()
    batchId: string;

    @IsString()
    courseId: string;

    @IsString()
    branchId: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sectionIds?: string[];

    // Schedule Details
    @ValidateNested()
    @Type(() => ScheduleDetails)    
    scheduleDetails: ScheduleDetails;

    // Faculty Assignment (for AUTO mode)
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    assignedFacultyIds?: string[];

    // Exam Sections with Questions
    @IsArray()
    @Type(() => CreateExamSection)
    examSections: CreateExamSection[];

}