import * as crypto from 'crypto';
import { Types } from 'mongoose';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamAnswerRepositoryService } from 'src/repositories/exam-answer-repository/exam-answer.repository';
import { ExamQuestionRepositoryService } from 'src/repositories/exam-question-repository/exam-question.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';

function hashQrToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class PublicWrittenAnswerService {
    constructor(
        private readonly examAnswerRepositoryService: ExamAnswerRepositoryService,
        private readonly examQuestionRepositoryService: ExamQuestionRepositoryService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly authJwtService: AuthJwtService,
    ) { }


    // Verify the QR token — stateless JWT check + stateful DB hash/expiry cross-check
    // (same belt-and-suspenders pattern as the password-reset flow), then load the answer row
    private async verifyAndGetAnswer(token: string) {
        const payload = this.authJwtService.verifyWrittenAnswerQrToken(token);

        const answer = await this.examAnswerRepositoryService.findById(payload.sub);
        if (!answer) {
            throw new NotFoundException('Answer not found');
        }
        if (answer.isFinalized) {
            throw new BadRequestException('This written answer has already been finalized');
        }
        if (!answer.qrTokenHash || hashQrToken(token) !== answer.qrTokenHash) {
            throw new BadRequestException('This QR code is no longer valid — please generate a new one from your exam screen');
        }
        if (!answer.qrTokenExpiresAt || answer.qrTokenExpiresAt.getTime() < Date.now()) {
            throw new BadRequestException('This QR code has expired — please generate a new one from your exam screen');
        }

        return answer;
    }


    // First contact from the phone — validates the token and returns the question to display
    async verifyTokenAPI(token: string) {
        const answer = await this.verifyAndGetAnswer(token);

        if (!answer.qrScannedAt) {
            await this.examAnswerRepositoryService.updateById((answer._id as Types.ObjectId).toString(), { qrScannedAt: new Date() });
        }

        const question = await this.examQuestionRepositoryService.findById(answer.questionId.toString());
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        return {
            questionText: question.text,
            marks: question.marks,
            existingPageCount: answer.pages.length,
        };
    }


    // Cloudinary signed-upload signature for one page photo
    async getUploadSignatureAPI(token: string, pageNumber: number) {
        const answer = await this.verifyAndGetAnswer(token);

        const publicId = `${pageNumber}`;
        const folder = `written-answers/${(answer._id as Types.ObjectId).toString()}`;

        return this.cloudinaryService.generateUploadSignature(publicId, folder);
    }


    // Persist one successfully-uploaded page's metadata
    async recordPageAPI(token: string, pageNumber: number, cloudinaryUrl: string) {
        const answer = await this.verifyAndGetAnswer(token);

        const updated = await this.examAnswerRepositoryService.upsertPage((answer._id as Types.ObjectId).toString(), {
            pageNumber,
            cloudinaryUrl,
            uploadedAt: new Date(),
        });

        return { pageCount: updated?.pages.length ?? answer.pages.length };
    }

}
