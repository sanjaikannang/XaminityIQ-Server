import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ResultStatus, GradeScale } from 'src/utils/enum';

export type ExamResultDocument = ExamResult & Document;

// Question-wise result details
@Schema({ _id: false })
export class QuestionResult {
    @Prop({ type: Types.ObjectId, ref: 'QuestionBank', required: true })
    questionId: Types.ObjectId;

    @Prop({ required: true })
    questionType: string;

    @Prop({ required: true })
    questionText: string; // Snapshot for historical reference

    @Prop({ required: true })
    maxMarks: number;

    @Prop({ required: true, default: 0 })
    marksObtained: number;

    @Prop()
    studentAnswer?: string;

    @Prop()
    correctAnswer?: string;

    @Prop({ default: false })
    isCorrect: boolean;

    @Prop({ default: false })
    isPartiallyCorrect: boolean;

    @Prop()
    timeSpent?: number; // in seconds

    @Prop()
    difficultyLevel?: string;

    @Prop()
    bloomsTaxonomy?: string;

    @Prop({ type: [String] })
    tags?: string[];

    @Prop()
    evaluatorComments?: string;

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    evaluatedBy?: Types.ObjectId;

    @Prop()
    evaluatedAt?: Date;
}

// Section-wise result summary
@Schema({ _id: false })
export class SectionResult {
    @Prop({ required: true })
    sectionId: string;

    @Prop({ required: true })
    sectionName: string;

    @Prop({ required: true })
    maxMarks: number;

    @Prop({ required: true, default: 0 })
    marksObtained: number;

    @Prop({ required: true })
    totalQuestions: number;

    @Prop({ required: true, default: 0 })
    questionsAttempted: number;

    @Prop({ required: true, default: 0 })
    correctAnswers: number;

    @Prop({ default: 0 })
    partiallyCorrectAnswers: number;

    @Prop({ default: 0 })
    incorrectAnswers: number;

    @Prop({ default: 0 })
    unattemptedQuestions: number;

    @Prop()
    percentage?: number;

    @Prop()
    timeSpent?: number; // in seconds

    @Prop()
    averageTimePerQuestion?: number; // in seconds
}

// Performance analytics
@Schema({ _id: false })
export class PerformanceAnalytics {
    // Difficulty-wise performance
    @Prop({
        type: {
            easy: {
                total: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                percentage: { type: Number, default: 0 }
            },
            medium: {
                total: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                percentage: { type: Number, default: 0 }
            },
            hard: {
                total: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                percentage: { type: Number, default: 0 }
            }
        }
    })
    difficultyWisePerformance?: {
        easy: { total: number; correct: number; percentage: number; };
        medium: { total: number; correct: number; percentage: number; };
        hard: { total: number; correct: number; percentage: number; };
    };

    // Bloom's Taxonomy performance
    @Prop({
        type: {
            remember: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
            understand: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
            apply: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
            analyze: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
            evaluate: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
            create: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } }
        }
    })
    bloomsPerformance?: {
        remember: { total: number; correct: number; percentage: number; };
        understand: { total: number; correct: number; percentage: number; };
        apply: { total: number; correct: number; percentage: number; };
        analyze: { total: number; correct: number; percentage: number; };
        evaluate: { total: number; correct: number; percentage: number; };
        create: { total: number; correct: number; percentage: number; };
    };

    // Question type performance
    @Prop({
        type: Map,
        of: {
            total: { type: Number, default: 0 },
            correct: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 }
        }
    })
    questionTypePerformance?: Map<string, {
        total: number;
        correct: number;
        percentage: number;
    }>;

    // Time management analysis
    @Prop({
        type: {
            totalTimeAllotted: { type: Number },
            totalTimeUsed: { type: Number },
            timeUtilizationPercentage: { type: Number },
            averageTimePerQuestion: { type: Number },
            timeManagementScore: { type: Number } // 0-100 based on optimal time usage
        }
    })
    timeAnalysis?: {
        totalTimeAllotted: number;
        totalTimeUsed: number;
        timeUtilizationPercentage: number;
        averageTimePerQuestion: number;
        timeManagementScore: number;
    };
}

// Statistical comparisons
@Schema({ _id: false })
export class StatisticalComparison {
    @Prop()
    classAverage?: number;

    @Prop()
    classHighest?: number;

    @Prop()
    classLowest?: number;

    @Prop()
    standardDeviation?: number;

    @Prop()
    percentile?: number; // Student's percentile in class

    @Prop()
    rank?: number; // Student's rank in class

    @Prop()
    totalStudents?: number;

    @Prop()
    studentsAbove?: number; // Number of students who scored above this student

    @Prop()
    studentsBelow?: number; // Number of students who scored below this student
}

// Main Exam Result Schema
@Schema({ timestamps: true })
export class ExamResult {
    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ExamAttempt', required: true })
    attemptId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ required: true })
    studentRollNumber: string;

    @Prop({ required: true })
    studentName: string; // Denormalized for quick access

    // Exam details snapshot
    @Prop({ required: true })
    examTitle: string;

    @Prop({ required: true })
    subject: string;

    @Prop({ required: true })
    academicYear: string;

    @Prop({ required: true })
    semester: string;

    @Prop()
    examDate?: Date;

    // Score details
    @Prop({ required: true })
    totalMaxMarks: number;

    @Prop({ required: true, default: 0 })
    totalMarksObtained: number;

    @Prop({ required: true })
    passingMarks: number;

    @Prop()
    percentage?: number;

    @Prop({ required: true, default: false })
    isPassed: boolean;

    @Prop({ enum: GradeScale })
    grade?: GradeScale;

    @Prop()
    gradePoints?: number;

    // Question and section results
    @Prop({ type: [QuestionResult], default: [] })
    questionResults: QuestionResult[];

    @Prop({ type: [SectionResult], default: [] })
    sectionResults: SectionResult[];

    // Statistical information
    @Prop({ required: true, default: 0 })
    totalQuestions: number;

    @Prop({ required: true, default: 0 })
    questionsAttempted: number;

    @Prop({ required: true, default: 0 })
    correctAnswers: number;

    @Prop({ default: 0 })
    partiallyCorrectAnswers: number;

    @Prop({ required: true, default: 0 })
    incorrectAnswers: number;

    @Prop({ required: true, default: 0 })
    unattemptedQuestions: number;

    @Prop()
    accuracy?: number; // Percentage of attempted questions answered correctly

    // Timing information
    @Prop()
    examDuration?: number; // Total allocated time in minutes

    @Prop()
    timeTaken?: number; // Actual time taken in minutes

    @Prop()
    timeUtilization?: number; // Percentage of allocated time used

    // Performance analytics
    @Prop({ type: PerformanceAnalytics })
    analytics?: PerformanceAnalytics;

    // Statistical comparison with class
    @Prop({ type: StatisticalComparison })
    classComparison?: StatisticalComparison;

    // Result status and processing
    @Prop({ enum: ResultStatus, default: ResultStatus.PENDING })
    status: ResultStatus;

    @Prop()
    publishedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    publishedBy?: Types.ObjectId;

    @Prop({ default: false })
    isVisible: boolean; // Whether result is visible to student

    // Evaluation details
    @Prop({ default: false })
    requiresManualReview: boolean;

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    reviewedBy?: Types.ObjectId;

    @Prop()
    reviewedAt?: Date;

    @Prop()
    reviewComments?: string;

    // Proctoring impact on result
    @Prop({ default: false })
    hadProctoringViolations: boolean;

    @Prop()
    proctoringScore?: number; // 0-100, lower means more violations

    @Prop()
    proctoringImpact?: string; // Description of how violations affected the result

    // Re-evaluation tracking
    @Prop({ default: 0 })
    revaluationCount: number;

    @Prop({
        type: [{
            requestedAt: { type: Date },
            requestedBy: { type: Types.ObjectId, ref: 'Student' },
            reason: { type: String },
            status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] },
            processedBy: { type: Types.ObjectId, ref: 'Faculty' },
            processedAt: { type: Date },
            oldMarks: { type: Number },
            newMarks: { type: Number },
            comments: { type: String }
        }]
    })
    revaluationHistory?: Array<{
        requestedAt: Date;
        requestedBy: Types.ObjectId;
        reason: string;
        status: string;
        processedBy?: Types.ObjectId;
        processedAt?: Date;
        oldMarks?: number;
        newMarks?: number;
        comments?: string;
    }>;

    // Additional metadata
    @Prop({ type: Map, of: String })
    metadata?: Map<string, string>;

    // Remarks and feedback
    @Prop()
    facultyRemarks?: string;

    @Prop()
    strengthAreas?: string[]; // Areas where student performed well

    @Prop()
    improvementAreas?: string[]; // Areas needing improvement

    @Prop()
    recommendations?: string[]; // Study recommendations

    // Certificate generation
    @Prop({ default: false })
    certificateGenerated: boolean;

    @Prop()
    certificateUrl?: string;

    @Prop()
    certificateGeneratedAt?: Date;
}

export const ExamResultSchema = SchemaFactory.createForClass(ExamResult);

// Indexes for better performance
ExamResultSchema.index({ examId: 1 });
ExamResultSchema.index({ studentId: 1 });
ExamResultSchema.index({ attemptId: 1 }, { unique: true });
ExamResultSchema.index({ studentRollNumber: 1 });
ExamResultSchema.index({ status: 1 });
ExamResultSchema.index({ isPassed: 1 });
ExamResultSchema.index({ publishedAt: 1 });
ExamResultSchema.index({ isVisible: 1 });

// Compound indexes
ExamResultSchema.index({ examId: 1, studentId: 1 });
ExamResultSchema.index({ examId: 1, totalMarksObtained: -1 });
ExamResultSchema.index({ examId: 1, percentage: -1 });
ExamResultSchema.index({ examId: 1, status: 1 });
ExamResultSchema.index({ studentId: 1, academicYear: 1 });
ExamResultSchema.index({ academicYear: 1, semester: 1, subject: 1 });
ExamResultSchema.index({ 'classComparison.rank': 1 });
ExamResultSchema.index({ 'classComparison.percentile': -1 });

// Text search for student names and subjects
ExamResultSchema.index({
    studentName: 'text',
    subject: 'text',
    examTitle: 'text'
});

// Pre-save middleware to calculate derived fields
ExamResultSchema.pre('save', function (next) {
    // Calculate percentage
    if (this.totalMaxMarks > 0) {
        this.percentage = (this.totalMarksObtained / this.totalMaxMarks) * 100;
    }

    // Calculate accuracy
    if (this.questionsAttempted > 0) {
        this.accuracy = ((this.correctAnswers + (this.partiallyCorrectAnswers * 0.5)) / this.questionsAttempted) * 100;
    }

    // Determine pass/fail status
    this.isPassed = this.totalMarksObtained >= this.passingMarks;

    // Calculate time utilization
    if (this.examDuration && this.timeTaken) {
        this.timeUtilization = (this.timeTaken / this.examDuration) * 100;
    }

    next();
});

// Virtual for comprehensive performance score
ExamResultSchema.virtual('performanceScore').get(function () {
    const scoreWeight = 0.6;
    const accuracyWeight = 0.2;
    const timeWeight = 0.2;

    const normalizedScore = this.percentage || 0;
    const normalizedAccuracy = this.accuracy || 0;
    const normalizedTime = this.timeUtilization ? Math.max(0, 100 - Math.abs(this.timeUtilization - 80)) : 0;

    return (normalizedScore * scoreWeight) + (normalizedAccuracy * accuracyWeight) + (normalizedTime * timeWeight);
});