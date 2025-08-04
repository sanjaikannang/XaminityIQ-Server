import { Type } from 'class-transformer';
import { ExamMode, QuestionType, DifficultyLevel } from 'src/utils/enum';
import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, IsArray, ValidateNested, IsDateString, Min, Max, IsNotEmpty } from 'class-validator';

export class ExamSchedule {
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsNumber()
    @Min(1)
    duration: number; // in minutes

    @IsString()
    @IsOptional()
    timeZone?: string = 'Asia/Kolkata';
}

export class ExamGrading {
    @IsNumber()
    @Min(1)
    totalMarks: number;

    @IsNumber()
    @Min(0)
    passingMarks: number;

    @IsBoolean()
    @IsOptional()
    negativeMarking?: boolean = false;

    @IsNumber()
    @Min(0)
    @IsOptional()
    negativeMarkingValue?: number = 0;

    @IsBoolean()
    @IsOptional()
    showResultImmediately?: boolean = false;

    @IsBoolean()
    @IsOptional()
    showCorrectAnswers?: boolean = false;

    @IsDateString()
    @IsOptional()
    resultPublishDate?: string;
}

export class ExamSettings {
    @IsBoolean()
    @IsOptional()
    randomizeQuestions?: boolean = false;

    @IsBoolean()
    @IsOptional()
    randomizeOptions?: boolean = false;

    @IsNumber()
    @Min(1)
    @IsOptional()
    questionsPerPage?: number = 1;

    @IsBoolean()
    @IsOptional()
    allowQuestionReview?: boolean = true;

    @IsBoolean()
    @IsOptional()
    allowQuestionSkip?: boolean = true;

    @IsBoolean()
    @IsOptional()
    showQuestionNumbers?: boolean = true;

    @IsBoolean()
    @IsOptional()
    preventCopyPaste?: boolean = true;

    @IsBoolean()
    @IsOptional()
    disableRightClick?: boolean = true;
}

export class ExamProctoring {
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    faculty?: string[]; // Faculty IDs

    @IsNumber()
    @Min(1)
    @Max(50)
    @IsOptional()
    maxStudentsPerProctor?: number = 20;

    @IsBoolean()
    @IsOptional()
    autoAdmitStudents?: boolean = false;

    @IsBoolean()
    @IsOptional()
    recordSession?: boolean = true;

    @IsBoolean()
    @IsOptional()
    enableChat?: boolean = false;

    @IsBoolean()
    @IsOptional()
    allowProctorIntervention?: boolean = true;
}

export class ExamSecurity {
    @IsBoolean()
    @IsOptional()
    requireCameraAccess?: boolean = true;

    @IsBoolean()
    @IsOptional()
    requireMicrophoneAccess?: boolean = true;

    @IsBoolean()
    @IsOptional()
    requireScreenShare?: boolean = true;

    @IsBoolean()
    @IsOptional()
    detectTabSwitch?: boolean = true;

    @IsBoolean()
    @IsOptional()
    detectMultipleMonitors?: boolean = true;

    @IsBoolean()
    @IsOptional()
    lockdownBrowser?: boolean = false;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    allowedApplications?: string[] = [];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    blockedWebsites?: string[] = [];

    @IsNumber()
    @Min(1)
    @Max(10)
    @IsOptional()
    maxViolations?: number = 3;
}

export class ExamContactInfo {
    @IsString()
    @IsOptional()
    supportEmail?: string;

    @IsString()
    @IsOptional()
    supportPhone?: string;

    @IsString()
    @IsOptional()
    emergencyContact?: string;
}

export class ExamInstructions {
    @IsString()
    @IsNotEmpty()
    instructions: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    technicalRequirements?: string[] = [];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    examRules?: string[] = [];

    @ValidateNested()
    @Type(() => ExamContactInfo)
    @IsOptional()
    contactInfo?: ExamContactInfo;
}

export class QuestionOption {
    @IsString()
    @IsNotEmpty()
    optionId: string;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsBoolean()
    isCorrect: boolean;
}

export class QuestionBlank {
    @IsString()
    @IsNotEmpty()
    blankId: string;

    @IsArray()
    @IsString({ each: true })
    correctAnswers: string[];

    @IsBoolean()
    @IsOptional()
    caseSensitive?: boolean = false;

    @IsBoolean()
    @IsOptional()
    acceptPartialCredit?: boolean = false;
}

export class QuestionEssaySettings {
    @IsNumber()
    @Min(1)
    @IsOptional()
    maxWords?: number;

    @IsNumber()
    @Min(1)
    @IsOptional()
    minWords?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    keywords?: string[] = [];

    @IsString()
    @IsOptional()
    rubric?: string;
}

export class CodingTestCase {
    @IsString()
    @IsNotEmpty()
    input: string;

    @IsString()
    @IsNotEmpty()
    expectedOutput: string;

    @IsBoolean()
    @IsOptional()
    isHidden?: boolean = false;

    @IsNumber()
    @Min(0)
    @IsOptional()
    points?: number = 1;
}

export class QuestionCodingSettings {
    @IsString()
    @IsOptional()
    language?: string;

    @IsString()
    @IsOptional()
    starterCode?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CodingTestCase)
    @IsOptional()
    testCases?: CodingTestCase[] = [];

    @IsNumber()
    @Min(1)
    @IsOptional()
    timeLimit?: number; // in seconds

    @IsNumber()
    @Min(1)
    @IsOptional()
    memoryLimit?: number; // in MB
}

export class QuestionMetadata {
    @IsString()
    @IsOptional()
    category?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[] = [];

    @IsString()
    @IsOptional()
    bloomsLevel?: string;

    @IsString()
    @IsOptional()
    learningOutcome?: string;
}

export class CreateQuestion {
    @IsEnum(QuestionType)
    type: QuestionType;

    @IsString()
    @IsNotEmpty()
    question: string;

    @IsString()
    @IsOptional()
    questionImage?: string;

    @IsString()
    @IsOptional()
    explanation?: string;

    @IsNumber()
    @Min(0.5)
    marks: number;

    @IsEnum(DifficultyLevel)
    @IsOptional()
    difficulty?: DifficultyLevel = DifficultyLevel.MEDIUM;

    @IsNumber()
    @Min(1)
    orderIndex: number;

    // For MCQ, Single Choice, True/False
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionOption)
    @IsOptional()
    options?: QuestionOption[];

    // For Fill in the blanks
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionBlank)
    @IsOptional()
    blanks?: QuestionBlank[];

    // For Essay questions
    @ValidateNested()
    @Type(() => QuestionEssaySettings)
    @IsOptional()
    essaySettings?: QuestionEssaySettings;

    // For Coding questions
    @ValidateNested()
    @Type(() => QuestionCodingSettings)
    @IsOptional()
    codingSettings?: QuestionCodingSettings;

    @ValidateNested()
    @Type(() => QuestionMetadata)
    @IsOptional()
    metadata?: QuestionMetadata;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;
}

export class CreateExamRequest {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    course: string;

    @IsString()
    @IsNotEmpty()
    branch: string;

    @IsNumber()
    @Min(1)
    @Max(8)
    semester: number;

    @IsString()
    @IsOptional()
    section?: string;

    @IsString()
    @IsNotEmpty()
    batch: string;

    @IsEnum(ExamMode)
    mode: ExamMode;

    @ValidateNested()
    @Type(() => ExamSchedule)
    schedule: ExamSchedule;

    @ValidateNested()
    @Type(() => ExamGrading)
    grading: ExamGrading;

    @ValidateNested()
    @Type(() => ExamSettings)
    @IsOptional()
    settings?: ExamSettings;

    @ValidateNested()
    @Type(() => ExamProctoring)
    @IsOptional()
    proctoring?: ExamProctoring;

    @ValidateNested()
    @Type(() => ExamSecurity)
    @IsOptional()
    security?: ExamSecurity;

    @ValidateNested()
    @Type(() => ExamInstructions)
    instructions: ExamInstructions;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestion)
    questions: CreateQuestion[];

    @IsBoolean()
    @IsOptional()
    saveAsDraft?: boolean = true;
}