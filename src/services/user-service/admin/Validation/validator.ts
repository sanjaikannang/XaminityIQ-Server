import { BadRequestException } from "@nestjs/common";
import { CreateExamRequest } from "src/api/user/admin/create-exam/create-exam.request";
import { ExamMode, QuestionType } from "src/utils/enum";

export async function validateCreateExamRequest(createExamData: CreateExamRequest): Promise<void> {

    // 1. Validate exam mode specific requirements
    await validateExamModeRequirements(createExamData);

    // 2. Validate total marks consistency
    await validateTotalMarksConsistency(createExamData);

    // 3. Validate section marks consistency
    await validateSectionMarksConsistency(createExamData);

    // 4. Validate questions consistency within sections
    await validateQuestionsConsistency(createExamData);

    // 5. Validate schedule details based on exam mode
    await validateScheduleDetails(createExamData);

    // 6. Validate passing marks
    await validatePassingMarks(createExamData);

    // 7. Validate section order and question order
    await validateOrderConsistency(createExamData);

    // 8. Validate question types consistency
    await validateQuestionTypesConsistency(createExamData);
}


// Validate exam mode specific requirements
async function validateExamModeRequirements(createExamData: CreateExamRequest): Promise<void> {
    const { examMode, assignedFacultyIds, scheduleDetails } = createExamData;

    if (examMode === ExamMode.AUTO) {
        // For AUTO mode, assignedFacultyIds should not be provided
        if (assignedFacultyIds && assignedFacultyIds.length > 0) {
            throw new BadRequestException('assignedFacultyIds should not be provided for AUTO exam mode');
        }

        // For AUTO mode, we need startDate and endDate
        if (!scheduleDetails.startDate || !scheduleDetails.endDate) {
            throw new BadRequestException('startDate and endDate are required for AUTO exam mode');
        }

        // examDate, startTime, endTime should not be provided for AUTO mode
        if (scheduleDetails.examDate || scheduleDetails.startTime || scheduleDetails.endTime) {
            throw new BadRequestException('examDate, startTime, and endTime should not be provided for AUTO exam mode');
        }

    } else if (examMode === ExamMode.PROCTORING) {
        // For PROCTORING mode, we need examDate, startTime, endTime
        if (!scheduleDetails.examDate || !scheduleDetails.startTime || !scheduleDetails.endTime) {
            throw new BadRequestException('examDate, startTime, and endTime are required for PROCTORING exam mode');
        }

        // startDate, endDate should not be provided for PROCTORING mode
        if (scheduleDetails.startDate || scheduleDetails.endDate) {
            throw new BadRequestException('startDate and endDate should not be provided for PROCTORING exam mode');
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(scheduleDetails.startTime)) {
            throw new BadRequestException('startTime must be in HH:MM format');
        }
        if (!timeRegex.test(scheduleDetails.endTime)) {
            throw new BadRequestException('endTime must be in HH:MM format');
        }

        // Validate that endTime is after startTime
        const [startHour, startMin] = scheduleDetails.startTime.split(':').map(Number);
        const [endHour, endMin] = scheduleDetails.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
            throw new BadRequestException('endTime must be after startTime');
        }
    }
}


// Validate total marks consistency across exam, sections, and questions
async function validateTotalMarksConsistency(createExamData: CreateExamRequest): Promise<void> {
    const { totalMarks, examSections } = createExamData;

    // Calculate total marks from sections
    const calculatedTotalMarks = examSections.reduce((sum, section) => sum + section.sectionMarks, 0);

    if (totalMarks !== calculatedTotalMarks) {
        throw new BadRequestException(
            `Total marks mismatch. Exam totalMarks: ${totalMarks}, Sum of section marks: ${calculatedTotalMarks}`
        );
    }
}


// Validate section marks consistency with questions
async function validateSectionMarksConsistency(createExamData: CreateExamRequest): Promise<void> {
    const { examSections } = createExamData;

    for (const section of examSections) {
        const { sectionMarks, questions, totalQuestions } = section;

        // Validate that totalQuestions matches actual questions count
        if (totalQuestions !== questions.length) {
            throw new BadRequestException(
                `Section "${section.sectionName}": totalQuestions (${totalQuestions}) does not match actual questions count (${questions.length})`
            );
        }

        // Calculate marks from questions
        const calculatedSectionMarks = questions.reduce((sum, question) => sum + question.marks, 0);

        if (sectionMarks !== calculatedSectionMarks) {
            throw new BadRequestException(
                `Section "${section.sectionName}": sectionMarks (${sectionMarks}) does not match sum of question marks (${calculatedSectionMarks})`
            );
        }
    }
}


// Validate questions consistency within sections
async function validateQuestionsConsistency(createExamData: CreateExamRequest): Promise<void> {
    const { examSections } = createExamData;

    for (const section of examSections) {
        const { sectionName, questions, questionType } = section;

        // Validate each question in the section
        for (const question of questions) {
            // Validate question type matches section question type
            if (question.questionType !== questionType) {
                throw new BadRequestException(
                    `Section "${sectionName}": Question "${question.questionText.substring(0, 50)}..." has questionType "${question.questionType}" but section expects "${questionType}"`
                );
            }

            // Validate question-specific requirements
            await validateQuestionSpecificRequirements(question, sectionName);
        }

        // Validate question order uniqueness within section
        const questionOrders = questions.map(q => q.questionOrder);
        const uniqueOrders = [...new Set(questionOrders)];
        if (questionOrders.length !== uniqueOrders.length) {
            throw new BadRequestException(
                `Section "${sectionName}": Duplicate question orders found`
            );
        }

        // Validate question order sequence (should be 1, 2, 3, ...)
        const sortedOrders = questionOrders.sort((a, b) => a - b);
        for (let i = 0; i < sortedOrders.length; i++) {
            if (sortedOrders[i] !== i + 1) {
                throw new BadRequestException(
                    `Section "${sectionName}": Question orders should be sequential starting from 1`
                );
            }
        }
    }
}


// Validate question-specific requirements based on question type
async function validateQuestionSpecificRequirements(question: any, sectionName: string): Promise<void> {
    const { questionType, options, correctAnswers, correctAnswer } = question;

    switch (questionType) {
        case QuestionType.MCQ:
            // MCQ questions must have options
            if (!options || options.length === 0) {
                throw new BadRequestException(
                    `Section "${sectionName}": MCQ question must have options`
                );
            }

            // At least one option must be correct
            const correctOptions = options.filter((opt: any) => opt.isCorrect);
            if (correctOptions.length === 0) {
                throw new BadRequestException(
                    `Section "${sectionName}": MCQ question must have at least one correct option`
                );
            }

            // Validate option text is not empty
            for (const option of options) {
                if (!option.optionText || option.optionText.trim() === '') {
                    throw new BadRequestException(
                        `Section "${sectionName}": MCQ option text cannot be empty`
                    );
                }
            }
            break;

        case QuestionType.SHORT_ANSWER:
        case QuestionType.LONG_ANSWER:
            // Short/Long answer questions must have correctAnswers
            if (!correctAnswers || correctAnswers.length === 0) {
                throw new BadRequestException(
                    `Section "${sectionName}": ${questionType} question must have correctAnswers`
                );
            }

            // Validate correctAnswers structure
            for (const answer of correctAnswers) {
                if (!answer.answerText || answer.answerText.trim() === '') {
                    throw new BadRequestException(
                        `Section "${sectionName}": Answer text cannot be empty`
                    );
                }

                if (!answer.keywords || answer.keywords.length === 0) {
                    throw new BadRequestException(
                        `Section "${sectionName}": Answer must have keywords for evaluation`
                    );
                }

                if (answer.marks <= 0) {
                    throw new BadRequestException(
                        `Section "${sectionName}": Answer marks must be greater than 0`
                    );
                }
            }

            // Total marks from correctAnswers should equal question marks
            const totalAnswerMarks = correctAnswers.reduce((sum: number, answer: any) => sum + answer.marks, 0);
            if (totalAnswerMarks !== question.marks) {
                throw new BadRequestException(
                    `Section "${sectionName}": Sum of answer marks (${totalAnswerMarks}) must equal question marks (${question.marks})`
                );
            }
            break;

        case QuestionType.TRUE_FALSE:
            // True/False questions must have correctAnswer
            if (correctAnswer === undefined || correctAnswer === null) {
                throw new BadRequestException(
                    `Section "${sectionName}": TRUE_FALSE question must have correctAnswer (true/false)`
                );
            }

            if (typeof correctAnswer !== 'boolean') {
                throw new BadRequestException(
                    `Section "${sectionName}": TRUE_FALSE correctAnswer must be boolean`
                );
            }
            break;

        default:
            throw new BadRequestException(
                `Section "${sectionName}": Invalid question type "${questionType}"`
            );
    }
}


// Validate schedule details based on exam mode
async function validateScheduleDetails(createExamData: CreateExamRequest): Promise<void> {
    const { examMode, scheduleDetails } = createExamData;

    if (examMode === ExamMode.AUTO) {
        const startDate = new Date(scheduleDetails.startDate!);
        const endDate = new Date(scheduleDetails.endDate!);
        const currentDate = new Date();

        // Start date should be in future or today
        if (startDate < new Date(currentDate.toDateString())) {
            throw new BadRequestException('startDate cannot be in the past');
        }

        // End date should be after start date
        if (endDate <= startDate) {
            throw new BadRequestException('endDate must be after startDate');
        }

    } else if (examMode === ExamMode.PROCTORING) {
        const examDate = new Date(scheduleDetails.examDate!);
        const currentDate = new Date();

        // Exam date should be in future or today
        if (examDate < new Date(currentDate.toDateString())) {
            throw new BadRequestException('examDate cannot be in the past');
        }
    }

    // Validate buffer time
    if (scheduleDetails.bufferTime) {
        if (scheduleDetails.bufferTime.beforeExam < 0 || scheduleDetails.bufferTime.afterExam < 0) {
            throw new BadRequestException('Buffer time cannot be negative');
        }
    }
}


// Validate passing marks
async function validatePassingMarks(createExamData: CreateExamRequest): Promise<void> {
    const { totalMarks, passingMarks } = createExamData;

    if (passingMarks > totalMarks) {
        throw new BadRequestException('Passing marks cannot be greater than total marks');
    }

    if (passingMarks < 0) {
        throw new BadRequestException('Passing marks cannot be negative');
    }
}


// Validate section order and consistency
async function validateOrderConsistency(createExamData: CreateExamRequest): Promise<void> {
    const { examSections } = createExamData;

    // Validate section order uniqueness
    const sectionOrders = examSections.map(section => section.sectionOrder);
    const uniqueSectionOrders = [...new Set(sectionOrders)];

    if (sectionOrders.length !== uniqueSectionOrders.length) {
        throw new BadRequestException('Duplicate section orders found');
    }

    // Validate section order sequence (should be 1, 2, 3, ...)
    const sortedSectionOrders = sectionOrders.sort((a, b) => a - b);
    for (let i = 0; i < sortedSectionOrders.length; i++) {
        if (sortedSectionOrders[i] !== i + 1) {
            throw new BadRequestException('Section orders should be sequential starting from 1');
        }
    }
}


// Validate question types consistency within sections
async function validateQuestionTypesConsistency(createExamData: CreateExamRequest): Promise<void> {
    const { examSections } = createExamData;

    for (const section of examSections) {
        const { sectionName, questionType, questions } = section;

        // Check if all questions in the section have the same question type as section
        const inconsistentQuestions = questions.filter(q => q.questionType !== questionType);

        if (inconsistentQuestions.length > 0) {
            throw new BadRequestException(
                `Section "${sectionName}": All questions must be of type "${questionType}"`
            );
        }
    }
}