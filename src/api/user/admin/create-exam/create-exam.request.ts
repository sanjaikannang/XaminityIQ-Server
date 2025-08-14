import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, Validate, ValidateNested, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { DifficultyLevel, ExamMode, QuestionType } from "src/utils/enum";

// Custom validator for section marks validation
@ValidatorConstraint({ name: 'sectionMarksValidator', async: false })
export class SectionMarksValidator implements ValidatorConstraintInterface {
    validate(examSections: CreateExamSection[], args: ValidationArguments) {
        const object = args.object as CreateExamRequest;
        const totalMarks = object.totalMarks;

        if (!examSections || !totalMarks) return false;

        const sectionMarksSum = examSections.reduce((sum, section) => sum + section.sectionMarks, 0);
        return sectionMarksSum === totalMarks;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Sum of all section marks must equal total exam marks';
    }
}

// Custom validator for questions count validation
@ValidatorConstraint({ name: 'questionsCountValidator', async: false })
export class QuestionsCountValidator implements ValidatorConstraintInterface {
    validate(questions: CreateQuestion[], args: ValidationArguments) {
        const object = args.object as CreateExamSection;
        const expectedCount = object.totalQuestions;

        if (!questions || !expectedCount) return false;

        return questions.length === expectedCount;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Number of questions must match totalQuestions count';
    }
}

// Custom validator for question marks validation within section
@ValidatorConstraint({ name: 'questionMarksValidator', async: false })
export class QuestionMarksValidator implements ValidatorConstraintInterface {
    validate(questions: CreateQuestion[], args: ValidationArguments) {
        const object = args.object as CreateExamSection;
        const sectionMarks = object.sectionMarks;

        if (!questions || !sectionMarks) return false;

        const questionMarksSum = questions.reduce((sum, question) => sum + question.marks, 0);
        return questionMarksSum === sectionMarks;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Sum of all question marks in section must equal section marks';
    }
}

// Custom validator for MCQ options validation
@ValidatorConstraint({ name: 'mcqOptionsValidator', async: false })
export class McqOptionsValidator implements ValidatorConstraintInterface {
    validate(options: QuestionOption[], args: ValidationArguments) {
        const object = args.object as CreateQuestion;

        if (object.questionType === QuestionType.MCQ) {
            if (!options || options.length < 2) return false;

            // Check if exactly one option is marked as correct
            const correctOptions = options.filter(option => option.isCorrect);
            return correctOptions.length === 1;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'MCQ questions must have at least 2 options with exactly one correct answer';
    }
}


// Custom validator for schedule details based on exam mode
@ValidatorConstraint({ name: 'scheduleDetailsValidator', async: false })
export class ScheduleDetailsValidator implements ValidatorConstraintInterface {
    validate(scheduleDetails: ScheduleDetails, args: ValidationArguments) {
        const object = args.object as CreateExamRequest;
        const examMode = object.examMode;

        if (!scheduleDetails) return false;

        if (examMode === ExamMode.PROCTORING) {
            return !!(scheduleDetails.examDate && scheduleDetails.startTime && scheduleDetails.endTime);
        } else if (examMode === ExamMode.AUTO) {
            return !!(scheduleDetails.startDate && scheduleDetails.endDate);
        }

        return false;
    }

    defaultMessage(args: ValidationArguments) {
        const object = args.object as CreateExamRequest;
        const examMode = object.examMode;

        if (examMode === ExamMode.PROCTORING) {
            return 'For PROCTORING mode, examDate, startTime, and endTime are required';
        } else if (examMode === ExamMode.AUTO) {
            return 'For AUTO mode, startDate and endDate are required';
        }

        return 'Invalid schedule details for the selected exam mode';
    }
}

// Custom validator for date range validation
@ValidatorConstraint({ name: 'dateRangeValidator', async: false })
export class DateRangeValidator implements ValidatorConstraintInterface {
    validate(scheduleDetails: ScheduleDetails, args: ValidationArguments) {
        if (!scheduleDetails) return false;

        // For AUTO mode, validate date range
        if (scheduleDetails.startDate && scheduleDetails.endDate) {
            const startDate = new Date(scheduleDetails.startDate);
            const endDate = new Date(scheduleDetails.endDate);
            const currentDate = new Date();

            return startDate >= currentDate && endDate > startDate;
        }

        // For PROCTORING mode, validate exam date
        if (scheduleDetails.examDate) {
            const examDate = new Date(scheduleDetails.examDate);
            const currentDate = new Date();

            return examDate >= currentDate;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Start date must be today or future, end date must be after start date, and exam date must be today or future';
    }
}

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
    @ArrayMinSize(2, { message: 'MCQ questions must have at least 2 options' })
    @ArrayMaxSize(6, { message: 'MCQ questions can have maximum 6 options' })
    @Validate(McqOptionsValidator)
    options?: QuestionOption[];

    // For Short/Long answer questions
    @IsOptional()
    @IsArray()
    @Type(() => CorrectAnswer)
    @ArrayMinSize(1, { message: 'At least one correct answer is required for text questions' })
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
    @Min(1)
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
    @ArrayMinSize(1, { message: 'Each section must have at least one question' })
    @Validate(QuestionsCountValidator)
    @Validate(QuestionMarksValidator)
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
    @ArrayMaxSize(10, { message: 'Maximum 10 general instructions allowed' })
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
    @ArrayMaxSize(20, { message: 'Maximum 20 sections can be assigned to an exam' })
    sectionIds?: string[];

    // Schedule Details
    @ValidateNested()
    @Type(() => ScheduleDetails)
    @Validate(ScheduleDetailsValidator)
    @Validate(DateRangeValidator)
    scheduleDetails: ScheduleDetails;

    // Faculty Assignment (only for PROCTORING mode or when specified)
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10, { message: 'Maximum 10 faculty members can be assigned' })
    assignedFacultyIds?: string[];

    // Exam Sections with Questions
    @IsArray()
    @Type(() => CreateExamSection)
    @ArrayMinSize(1, { message: 'At least one exam section is required' })
    @ArrayMaxSize(10, { message: 'Maximum 10 sections allowed per exam' })
    @Validate(SectionMarksValidator)
    examSections: CreateExamSection[];
    
}