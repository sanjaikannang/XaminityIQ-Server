import { BadRequestException } from "@nestjs/common";


// Validate Exam Sections
export async function validateExamSections(examSections: any[]): Promise<void> {
    if (!examSections || examSections.length === 0) {
        throw new BadRequestException('At least one exam section is required');
    }

    // Validate section orders are unique
    const sectionOrders = examSections.map(section => section.sectionOrder);
    const uniqueOrders = new Set(sectionOrders);

    if (sectionOrders.length !== uniqueOrders.size) {
        throw new BadRequestException('Section orders must be unique');
    }

    // Validate each section has questions
    for (const section of examSections) {
        if (!section.questions || section.questions.length === 0) {
            throw new BadRequestException(`Section "${section.sectionName}" must have at least one question`);
        }

        if (section.questions.length !== section.totalQuestions) {
            throw new BadRequestException(
                `Section "${section.sectionName}" totalQuestions (${section.totalQuestions}) must match actual questions count (${section.questions.length})`
            );
        }

        // Validate question orders within section
        const questionOrders = section.questions.map(q => q.questionOrder);
        const uniqueQuestionOrders = new Set(questionOrders);

        if (questionOrders.length !== uniqueQuestionOrders.size) {
            throw new BadRequestException(`Question orders in section "${section.sectionName}" must be unique`);
        }
    }
}