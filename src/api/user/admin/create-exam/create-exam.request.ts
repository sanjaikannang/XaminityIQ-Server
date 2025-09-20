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

    @IsEnum(ExamMode)
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

    // Faculty Assignment (only for PROCTORING mode or when specified)
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    assignedFacultyIds?: string[];

    // Exam Sections with Questions
    @IsArray()
    @Type(() => CreateExamSection)
    examSections: CreateExamSection[];

}


// EXAM_MODE = AUTO
// {
//   "examTitle": "Mathematics Mid-Term Exam - AUTO Mode",
//   "examDescription": "Comprehensive mathematics examination covering algebra and geometry",
//   "subject": "Mathematics",
//   "totalMarks": 100,
//   "passingMarks": 40,
//   "duration": 120,
//   "examMode": "AUTO",
//   "generalInstructions": [
//     "Read all questions carefully before answering",
//     "Attempt all questions",
//     "Use of calculator is allowed",
//     "Show all working for numerical problems"
//   ],
//   "batchId": "507f1f77bcf86cd799439011",
//   "courseId": "507f1f77bcf86cd799439012",
//   "branchId": "507f1f77bcf86cd799439013",
//   "sectionIds": [
//     "507f1f77bcf86cd799439014",
//     "507f1f77bcf86cd799439015"
//   ],
//   "scheduleDetails": {
//     "startDate": "2025-08-20T00:00:00.000Z",
//     "endDate": "2025-08-25T23:59:59.000Z",
//     "bufferTime": {
//       "beforeExam": 5,
//       "afterExam": 10
//     }
//   },
//   "examSections": [
//     {
//       "sectionName": "Section A - Multiple Choice Questions",
//       "sectionOrder": 1,
//       "sectionMarks": 40,
//       "questionType": "MCQ",
//       "totalQuestions": 4,
//       "sectionInstructions": [
//         "Choose the best answer for each question",
//         "Each question carries 10 marks"
//       ],
//       "timeLimit": 45,
//       "isOptional": false,
//       "questions": [
//         {
//           "questionText": "What is the value of x in the equation 2x + 5 = 15?",
//           "questionType": "MCQ",
//           "marks": 10,
//           "questionOrder": 1,
//           "difficultyLevel": "EASY",
//           "options": [
//             {
//               "optionText": "x = 5",
//               "isCorrect": true
//             },
//             {
//               "optionText": "x = 10",
//               "isCorrect": false
//             },
//             {
//               "optionText": "x = 7.5",
//               "isCorrect": false
//             },
//             {
//               "optionText": "x = 2.5",
//               "isCorrect": false
//             }
//           ],
//           "explanation": "2x + 5 = 15, so 2x = 10, therefore x = 5"
//         },
//         {
//           "questionText": "Which of the following is a prime number?",
//           "questionType": "MCQ",
//           "marks": 10,
//           "questionOrder": 2,
//           "difficultyLevel": "MEDIUM",
//           "options": [
//             {
//               "optionText": "21",
//               "isCorrect": false
//             },
//             {
//               "optionText": "23",
//               "isCorrect": true
//             },
//             {
//               "optionText": "25",
//               "isCorrect": false
//             },
//             {
//               "optionText": "27",
//               "isCorrect": false
//             }
//           ],
//           "explanation": "23 is a prime number as it is only divisible by 1 and itself"
//         },
//         {
//           "questionText": "What is the area of a circle with radius 7 cm? (Use π = 22/7)",
//           "questionType": "MCQ",
//           "marks": 10,
//           "questionOrder": 3,
//           "difficultyLevel": "MEDIUM",
//           "options": [
//             {
//               "optionText": "154 cm²",
//               "isCorrect": true
//             },
//             {
//               "optionText": "44 cm²",
//               "isCorrect": false
//             },
//             {
//               "optionText": "308 cm²",
//               "isCorrect": false
//             },
//             {
//               "optionText": "77 cm²",
//               "isCorrect": false
//             }
//           ],
//           "explanation": "Area = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm²"
//         },
//         {
//           "questionText": "If log₂(x) = 3, what is the value of x?",
//           "questionType": "MCQ",
//           "marks": 10,
//           "questionOrder": 4,
//           "difficultyLevel": "HARD",
//           "options": [
//             {
//               "optionText": "6",
//               "isCorrect": false
//             },
//             {
//               "optionText": "8",
//               "isCorrect": true
//             },
//             {
//               "optionText": "9",
//               "isCorrect": false
//             },
//             {
//               "optionText": "12",
//               "isCorrect": false
//             }
//           ],
//           "explanation": "If log₂(x) = 3, then x = 2³ = 8"
//         }
//       ]
//     },
//     {
//       "sectionName": "Section B - Short Answer Questions",
//       "sectionOrder": 2,
//       "sectionMarks": 35,
//       "questionType": "SHORT_ANSWER",
//       "totalQuestions": 3,
//       "sectionInstructions": [
//         "Answer in brief",
//         "Show your working"
//       ],
//       "timeLimit": 40,
//       "isOptional": false,
//       "questions": [
//         {
//           "questionText": "Solve the quadratic equation x² - 5x + 6 = 0",
//           "questionType": "SHORT_ANSWER",
//           "marks": 15,
//           "questionOrder": 1,
//           "difficultyLevel": "MEDIUM",
//           "correctAnswers": [
//             {
//               "answerText": "x = 2 or x = 3",
//               "keywords": ["x = 2", "x = 3", "factorization", "(x-2)(x-3)"],
//               "marks": 15
//             }
//           ],
//           "explanation": "x² - 5x + 6 = (x-2)(x-3) = 0, so x = 2 or x = 3"
//         },
//         {
//           "questionText": "Find the derivative of f(x) = 3x² + 2x - 1",
//           "questionType": "SHORT_ANSWER",
//           "marks": 10,
//           "questionOrder": 2,
//           "difficultyLevel": "MEDIUM",
//           "correctAnswers": [
//             {
//               "answerText": "f'(x) = 6x + 2",
//               "keywords": ["6x + 2", "derivative", "differentiation"],
//               "marks": 10
//             }
//           ],
//           "explanation": "Using power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-1) = 0"
//         },
//         {
//           "questionText": "Calculate the mean of the following data: 2, 4, 6, 8, 10",
//           "questionType": "SHORT_ANSWER",
//           "marks": 10,
//           "questionOrder": 3,
//           "difficultyLevel": "EASY",
//           "correctAnswers": [
//             {
//               "answerText": "Mean = 6",
//               "keywords": ["6", "mean", "average", "sum/count"],
//               "marks": 10
//             }
//           ],
//           "explanation": "Mean = (2+4+6+8+10)/5 = 30/5 = 6"
//         }
//       ]
//     },
//     {
//       "sectionName": "Section C - True/False Questions",
//       "sectionOrder": 3,
//       "sectionMarks": 25,
//       "questionType": "TRUE_FALSE",
//       "totalQuestions": 5,
//       "sectionInstructions": [
//         "Mark True or False for each statement"
//       ],
//       "timeLimit": 35,
//       "isOptional": false,
//       "questions": [
//         {
//           "questionText": "The square root of 16 is 4",
//           "questionType": "TRUE_FALSE",
//           "marks": 5,
//           "questionOrder": 1,
//           "difficultyLevel": "EASY",
//           "correctAnswer": true,
//           "explanation": "√16 = 4 is correct"
//         },
//         {
//           "questionText": "All prime numbers are odd numbers",
//           "questionType": "TRUE_FALSE",
//           "marks": 5,
//           "questionOrder": 2,
//           "difficultyLevel": "MEDIUM",
//           "correctAnswer": false,
//           "explanation": "2 is a prime number but it is even"
//         },
//         {
//           "questionText": "The sum of angles in a triangle is 180°",
//           "questionType": "TRUE_FALSE",
//           "marks": 5,
//           "questionOrder": 3,
//           "difficultyLevel": "EASY",
//           "correctAnswer": true,
//           "explanation": "This is a fundamental property of triangles"
//         },
//         {
//           "questionText": "Zero is a positive number",
//           "questionType": "TRUE_FALSE",
//           "marks": 5,
//           "questionOrder": 4,
//           "difficultyLevel": "EASY",
//           "correctAnswer": false,
//           "explanation": "Zero is neither positive nor negative"
//         },
//         {
//           "questionText": "The logarithm of 1 to any base is 0",
//           "questionType": "TRUE_FALSE",
//           "marks": 5,
//           "questionOrder": 5,
//           "difficultyLevel": "MEDIUM",
//           "correctAnswer": true,
//           "explanation": "log_a(1) = 0 for any base a > 0 and a ≠ 1"
//         }
//       ]
//     }
//   ]
// }

// EXAM_MODE = PROCTORING
// {
//     "examTitle": "Physics Final Exam - PROCTORING Mode",
//         "examDescription": "Comprehensive physics examination covering mechanics and thermodynamics",
//             "subject": "Physics",
//                 "totalMarks": 80,
//                     "passingMarks": 32,
//                         "duration": 180,
//                             "examMode": "PROCTORING",
//                                 "generalInstructions": [
//                                     "Read all questions carefully",
//                                     "Answer all sections",
//                                     "Use of scientific calculator is allowed",
//                                     "Draw neat diagrams wherever required"
//                                 ],
//                                     "batchId": "507f1f77bcf86cd799439011",
//                                         "courseId": "507f1f77bcf86cd799439012",
//                                             "branchId": "507f1f77bcf86cd799439013",
//                                                 "sectionIds": [
//                                                     "507f1f77bcf86cd799439014"
//                                                 ],
//                                                     "scheduleDetails": {
//         "examDate": "2025-08-22T00:00:00.000Z",
//             "startTime": "09:00",
//                 "endTime": "12:00",
//                     "bufferTime": {
//             "beforeExam": 10,
//                 "afterExam": 15
//         }
//     },
//     "assignedFacultyIds": [
//         "507f1f77bcf86cd799439020",
//         "507f1f77bcf86cd799439021"
//     ],
//         "examSections": [
//             {
//                 "sectionName": "Section A - Multiple Choice Questions",
//                 "sectionOrder": 1,
//                 "sectionMarks": 30,
//                 "questionType": "MCQ",
//                 "totalQuestions": 6,
//                 "sectionInstructions": [
//                     "Choose the correct option",
//                     "Each question carries 5 marks"
//                 ],
//                 "timeLimit": 60,
//                 "isOptional": false,
//                 "questions": [
//                     {
//                         "questionText": "What is the SI unit of force?",
//                         "questionType": "MCQ",
//                         "marks": 5,
//                         "questionOrder": 1,
//                         "difficultyLevel": "EASY",
//                         "options": [
//                             {
//                                 "optionText": "Newton",
//                                 "isCorrect": true
//                             },
//                             {
//                                 "optionText": "Joule",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Watt",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Pascal",
//                                 "isCorrect": false
//                             }
//                         ],
//                         "explanation": "Newton (N) is the SI unit of force"
//                     },
//                     {
//                         "questionText": "According to Newton's first law, an object at rest will:",
//                         "questionType": "MCQ",
//                         "marks": 5,
//                         "questionOrder": 2,
//                         "difficultyLevel": "MEDIUM",
//                         "options": [
//                             {
//                                 "optionText": "Always remain at rest",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Remain at rest unless acted upon by an external force",
//                                 "isCorrect": true
//                             },
//                             {
//                                 "optionText": "Start moving after some time",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Move in a circular path",
//                                 "isCorrect": false
//                             }
//                         ],
//                         "explanation": "Newton's first law states that objects at rest stay at rest unless acted upon by an external force"
//                     },
//                     {
//                         "questionText": "What is the acceleration due to gravity on Earth?",
//                         "questionType": "MCQ",
//                         "marks": 5,
//                         "questionOrder": 3,
//                         "difficultyLevel": "EASY",
//                         "options": [
//                             {
//                                 "optionText": "9.8 m/s²",
//                                 "isCorrect": true
//                             },
//                             {
//                                 "optionText": "8.9 m/s²",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "10.8 m/s²",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "11.2 m/s²",
//                                 "isCorrect": false
//                             }
//                         ],
//                         "explanation": "Standard acceleration due to gravity is 9.8 m/s²"
//                     },
//                     {
//                         "questionText": "Which law relates force, mass, and acceleration?",
//                         "questionType": "MCQ",
//                         "marks": 5,
//                         "questionOrder": 4,
//                         "difficultyLevel": "MEDIUM",
//                         "options": [
//                             {
//                                 "optionText": "Newton's First Law",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Newton's Second Law",
//                                 "isCorrect": true
//                             },
//                             {
//                                 "optionText": "Newton's Third Law",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Law of Conservation of Energy",
//                                 "isCorrect": false
//                             }
//                         ],
//                         "explanation": "Newton's Second Law: F = ma"
//                     },
//                     {
//                         "questionText": "What is the unit of work in SI system?",
//                         "questionType": "MCQ",
//                         "marks": 5,
//                         "questionOrder": 5,
//                         "difficultyLevel": "EASY",
//                         "options": [
//                             {
//                                 "optionText": "Newton",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Joule",
//                                 "isCorrect": true
//                             },
//                             {
//                                 "optionText": "Watt",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Pascal",
//                                 "isCorrect": false
//                             }
//                         ],
//                         "explanation": "Joule (J) is the SI unit of work and energy"
//                     },
//                     {
//                         "questionText": "Which of the following is a scalar quantity?",
//                         "questionType": "MCQ",
//                         "marks": 5,
//                         "questionOrder": 6,
//                         "difficultyLevel": "MEDIUM",
//                         "options": [
//                             {
//                                 "optionText": "Velocity",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Acceleration",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Force",
//                                 "isCorrect": false
//                             },
//                             {
//                                 "optionText": "Speed",
//                                 "isCorrect": true
//                             }
//                         ],
//                         "explanation": "Speed is a scalar quantity (has magnitude only), while velocity, acceleration, and force are vector quantities"
//                     }
//                 ]
//             },
//             {
//                 "sectionName": "Section B - Long Answer Questions",
//                 "sectionOrder": 2,
//                 "sectionMarks": 50,
//                 "questionType": "LONG_ANSWER",
//                 "totalQuestions": 2,
//                 "sectionInstructions": [
//                     "Answer in detail with proper explanations",
//                     "Draw diagrams wherever necessary",
//                     "Show all calculations"
//                 ],
//                 "timeLimit": 120,
//                 "isOptional": false,
//                 "questions": [
//                     {
//                         "questionText": "Derive the equations of motion for uniformly accelerated motion. Also, solve: A car accelerates from rest at 2 m/s² for 10 seconds. Calculate the final velocity and distance covered.",
//                         "questionType": "LONG_ANSWER",
//                         "marks": 25,
//                         "questionOrder": 1,
//                         "difficultyLevel": "HARD",
//                         "correctAnswers": [
//                             {
//                                 "answerText": "First equation: v = u + at, Second equation: s = ut + ½at², Third equation: v² = u² + 2as",
//                                 "keywords": ["v = u + at", "s = ut + ½at²", "v² = u² + 2as", "equations of motion"],
//                                 "marks": 15
//                             },
//                             {
//                                 "answerText": "Final velocity = 20 m/s, Distance covered = 100 m",
//                                 "keywords": ["20 m/s", "100 m", "final velocity", "distance", "calculation"],
//                                 "marks": 10
//                             }
//                         ],
//                         "explanation": "The three equations of motion are fundamental for uniformly accelerated motion. For the numerical: v = 0 + 2×10 = 20 m/s, s = 0×10 + ½×2×10² = 100 m"
//                     },
//                     {
//                         "questionText": "Explain Newton's three laws of motion with real-life examples. Also, calculate the force required to accelerate a 500 kg car from 0 to 60 km/h in 8 seconds.",
//                         "questionType": "LONG_ANSWER",
//                         "marks": 25,
//                         "questionOrder": 2,
//                         "difficultyLevel": "HARD",
//                         "correctAnswers": [
//                             {
//                                 "answerText": "First Law: Law of Inertia - objects at rest stay at rest, objects in motion stay in motion unless acted upon by external force",
//                                 "keywords": ["law of inertia", "external force", "rest", "motion"],
//                                 "marks": 8
//                             },
//                             {
//                                 "answerText": "Second Law: F = ma - force equals mass times acceleration",
//                                 "keywords": ["F = ma", "force", "mass", "acceleration"],
//                                 "marks": 8
//                             },
//                             {
//                                 "answerText": "Third Law: For every action, there is an equal and opposite reaction",
//                                 "keywords": ["action", "reaction", "equal", "opposite"],
//                                 "marks": 4
//                             },
//                             {
//                                 "answerText": "Force required = 1041.67 N",
//                                 "keywords": ["1041.67 N", "force calculation", "acceleration"],
//                                 "marks": 5
//                             }
//                         ],
//                         "explanation": "Newton's laws are fundamental to mechanics. For calculation: 60 km/h = 16.67 m/s, a = 16.67/8 = 2.08 m/s², F = 500 × 2.08 = 1041.67 N"
//                     }
//                 ]
//             }
//         ]
// }