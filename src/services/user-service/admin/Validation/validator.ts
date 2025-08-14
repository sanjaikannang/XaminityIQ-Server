import { BadRequestException } from "@nestjs/common";
import { CreateExamRequest } from "src/api/user/admin/create-exam/create-exam.request";
import { ExamMode, QuestionType } from "src/utils/enum";

// Comprehensive Validation Method
export async function performComprehensiveValidation(createExamData: CreateExamRequest): Promise<void> {
    // 1. Validate passing marks against total marks
    this.validatePassingMarks(createExamData);

    // 2. Validate exam mode specific requirements
    this.validateExamModeRequirements(createExamData);

    // 3. Validate section marks sum equals total marks
    this.validateSectionMarksSum(createExamData);

    // 4. Validate questions count in each section
    this.validateQuestionsCount(createExamData);

    // 5. Validate question types consistency
    this.validateQuestionTypes(createExamData);

    // 6. Validate MCQ questions have correct options
    this.validateMCQQuestions(createExamData);

    // 7. Validate text questions have correct answers
    this.validateTextQuestions(createExamData);

    // 8. Validate True/False questions
    this.validateTrueFalseQuestions(createExamData);

    // 9. Validate question orders
    this.validateQuestionOrders(createExamData);

    // 10. Validate section orders
    this.validateSectionOrders(createExamData);

    // 11. Validate time constraints
    this.validateTimeConstraints(createExamData);

    // 12. Validate duplicate question texts
    await this.validateDuplicateQuestions(createExamData);
}

// 1. Validate Passing Marks
export async function validatePassingMarks(createExamData: CreateExamRequest) {
    if (createExamData.passingMarks > createExamData.totalMarks) {
        throw new BadRequestException('Passing marks cannot exceed total marks');
    }

    if (createExamData.passingMarks < 0) {
        throw new BadRequestException('Passing marks cannot be negative');
    }

    // Validate passing marks is reasonable (typically 30-80% of total marks)
    const passingPercentage = (createExamData.passingMarks / createExamData.totalMarks) * 100;
    if (passingPercentage < 10 || passingPercentage > 90) {
        throw new BadRequestException('Passing marks should be between 10% and 90% of total marks');
    }
}

// 2. Validate Exam Mode Requirements
export async function validateExamModeRequirements(createExamData: CreateExamRequest) {
    if (createExamData.examMode === ExamMode.AUTO) {
        // For AUTO mode, assignedFacultyIds should not be required
        if (createExamData.assignedFacultyIds && createExamData.assignedFacultyIds.length > 0) {
            console.warn('Faculty assignment is not required for AUTO mode, but will be stored if provided');
        }

        // Validate AUTO mode schedule details
        if (!createExamData.scheduleDetails.startDate || !createExamData.scheduleDetails.endDate) {
            throw new BadRequestException('For AUTO mode, startDate and endDate are required');
        }
    } else if (createExamData.examMode === ExamMode.PROCTORING) {
        // For PROCTORING mode, assignedFacultyIds are recommended
        if (!createExamData.assignedFacultyIds || createExamData.assignedFacultyIds.length === 0) {
            console.warn('Faculty assignment is recommended for PROCTORING mode');
        }

        // Validate PROCTORING mode schedule details
        if (!createExamData.scheduleDetails.examDate ||
            !createExamData.scheduleDetails.startTime ||
            !createExamData.scheduleDetails.endTime) {
            throw new BadRequestException('For PROCTORING mode, examDate, startTime, and endTime are required');
        }
    }
}

// 3. Validate Section Marks Sum
export async function validateSectionMarksSum(createExamData: CreateExamRequest) {
    const sectionMarksSum = createExamData.examSections.reduce((sum, section) => sum + section.sectionMarks, 0);

    if (sectionMarksSum !== createExamData.totalMarks) {
        throw new BadRequestException(
            `Sum of section marks (${sectionMarksSum}) must equal total exam marks (${createExamData.totalMarks})`
        );
    }
}

// 4. Validate Questions Count
export async function validateQuestionsCount(createExamData: CreateExamRequest) {
    createExamData.examSections.forEach((section, sectionIndex) => {
        if (section.questions.length !== section.totalQuestions) {
            throw new BadRequestException(
                `Section ${sectionIndex + 1} (${section.sectionName}): Expected ${section.totalQuestions} questions, but got ${section.questions.length} questions`
            );
        }

        // Validate question marks sum equals section marks
        const questionMarksSum = section.questions.reduce((sum, question) => sum + question.marks, 0);
        if (questionMarksSum !== section.sectionMarks) {
            throw new BadRequestException(
                `Section ${sectionIndex + 1} (${section.sectionName}): Sum of question marks (${questionMarksSum}) must equal section marks (${section.sectionMarks})`
            );
        }
    });
}

// 5. Validate Question Types Consistency
export async function validateQuestionTypes(createExamData: CreateExamRequest) {
    createExamData.examSections.forEach((section, sectionIndex) => {
        section.questions.forEach((question, questionIndex) => {
            if (question.questionType !== section.questionType) {
                throw new BadRequestException(
                    `Section ${sectionIndex + 1}, Question ${questionIndex + 1}: Question type (${question.questionType}) must match section question type (${section.questionType})`
                );
            }
        });
    });
}

// 6. Validate MCQ Questions
export async function validateMCQQuestions(createExamData: CreateExamRequest) {
    createExamData.examSections.forEach((section, sectionIndex) => {
        if (section.questionType === QuestionType.MCQ) {
            section.questions.forEach((question, questionIndex) => {
                if (!question.options || question.options.length < 2) {
                    throw new BadRequestException(
                        `Section ${sectionIndex + 1}, Question ${questionIndex + 1}: MCQ questions must have at least 2 options`
                    );
                }

                const correctOptions = question.options.filter(option => option.isCorrect);
                if (correctOptions.length !== 1) {
                    throw new BadRequestException(
                        `Section ${sectionIndex + 1}, Question ${questionIndex + 1}: MCQ questions must have exactly one correct option`
                    );
                }

                // Validate option texts are not empty
                question.options.forEach((option, optionIndex) => {
                    if (!option.optionText.trim()) {
                        throw new BadRequestException(
                            `Section ${sectionIndex + 1}, Question ${questionIndex + 1}, Option ${optionIndex + 1}: Option text cannot be empty`
                        );
                    }
                });
            });
        }
    });
}

// 7. Validate Text Questions (SHORT_ANSWER, LONG_ANSWER)
export async function validateTextQuestions(createExamData: CreateExamRequest) {
    const textQuestionTypes = [QuestionType.SHORT_ANSWER, QuestionType.LONG_ANSWER];

    createExamData.examSections.forEach((section, sectionIndex) => {
        if (textQuestionTypes.includes(section.questionType)) {
            section.questions.forEach((question, questionIndex) => {
                if (!question.correctAnswers || question.correctAnswers.length === 0) {
                    throw new BadRequestException(
                        `Section ${sectionIndex + 1}, Question ${questionIndex + 1}: Text questions must have at least one correct answer`
                    );
                }

                question.correctAnswers.forEach((correctAnswer, answerIndex) => {
                    if (!correctAnswer.answerText.trim()) {
                        throw new BadRequestException(
                            `Section ${sectionIndex + 1}, Question ${questionIndex + 1}, Answer ${answerIndex + 1}: Answer text cannot be empty`
                        );
                    }

                    if (!correctAnswer.keywords || correctAnswer.keywords.length === 0) {
                        throw new BadRequestException(
                            `Section ${sectionIndex + 1}, Question ${questionIndex + 1}, Answer ${answerIndex + 1}: At least one keyword is required`
                        );
                    }

                    if (correctAnswer.marks > question.marks) {
                        throw new BadRequestException(
                            `Section ${sectionIndex + 1}, Question ${questionIndex + 1}, Answer ${answerIndex + 1}: Answer marks cannot exceed question marks`
                        );
                    }
                });
            });
        }
    });
}

// 8. Validate True/False Questions
export async function validateTrueFalseQuestions(createExamData: CreateExamRequest) {
    createExamData.examSections.forEach((section, sectionIndex) => {
        if (section.questionType === QuestionType.TRUE_FALSE) {
            section.questions.forEach((question, questionIndex) => {
                if (question.correctAnswer === undefined || question.correctAnswer === null) {
                    throw new BadRequestException(
                        `Section ${sectionIndex + 1}, Question ${questionIndex + 1}: True/False questions must have a correct answer (true or false)`
                    );
                }
            });
        }
    });
}

// 9. Validate Question Orders
export async function validateQuestionOrders(createExamData: CreateExamRequest) {
    createExamData.examSections.forEach((section, sectionIndex) => {
        const questionOrders = section.questions.map(q => q.questionOrder).sort((a, b) => a - b);
        const expectedOrders = Array.from({ length: section.questions.length }, (_, i) => i + 1);

        if (!this.arraysEqual(questionOrders, expectedOrders)) {
            throw new BadRequestException(
                `Section ${sectionIndex + 1} (${section.sectionName}): Question orders must be sequential starting from 1`
            );
        }
    });
}

// 10. Validate Section Orders
export async function validateSectionOrders(createExamData: CreateExamRequest) {
    const sectionOrders = createExamData.examSections.map(s => s.sectionOrder).sort((a, b) => a - b);
    const expectedOrders = Array.from({ length: createExamData.examSections.length }, (_, i) => i + 1);

    if (!this.arraysEqual(sectionOrders, expectedOrders)) {
        throw new BadRequestException('Section orders must be sequential starting from 1');
    }
}

// 11. Validate Time Constraints
export async function validateTimeConstraints(createExamData: CreateExamRequest) {
    let totalSectionTimeLimit = 0;

    createExamData.examSections.forEach((section, sectionIndex) => {
        if (section.timeLimit) {
            totalSectionTimeLimit += section.timeLimit;
        }
    });

    // If sections have time limits, their sum should not exceed exam duration
    if (totalSectionTimeLimit > 0 && totalSectionTimeLimit > createExamData.duration) {
        throw new BadRequestException(
            `Total section time limits (${totalSectionTimeLimit} minutes) cannot exceed exam duration (${createExamData.duration} minutes)`
        );
    }

    // Validate buffer times
    if (createExamData.scheduleDetails.bufferTime) {
        const { beforeExam, afterExam } = createExamData.scheduleDetails.bufferTime;
        if (beforeExam && beforeExam > 60) {
            throw new BadRequestException('Buffer time before exam cannot exceed 60 minutes');
        }
        if (afterExam && afterExam > 60) {
            throw new BadRequestException('Buffer time after exam cannot exceed 60 minutes');
        }
    }
}

// 12. Validate Duplicate Questions
export async function validateDuplicateQuestions(createExamData: CreateExamRequest) {
    const allQuestionTexts: string[] = [];

    createExamData.examSections.forEach(section => {
        section.questions.forEach(question => {
            const normalizedText = question.questionText.toLowerCase().trim();
            if (allQuestionTexts.includes(normalizedText)) {
                throw new BadRequestException(`Duplicate question found: "${question.questionText}"`);
            }
            allQuestionTexts.push(normalizedText);
        });
    });
}
