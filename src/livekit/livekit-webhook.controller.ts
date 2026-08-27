import { Request } from 'express';
import { WebhookReceiver } from 'livekit-server-sdk';
import { ConfigService } from 'src/config/config.service';
import { LiveKitWebhookService } from './livekit-webhook.service';
import { Controller, Post, Req, HttpCode, UnauthorizedException, Logger } from '@nestjs/common';

// Public, unauthenticated endpoint — LiveKit's own servers call this, not a
// logged-in user. Authenticity is instead verified per-request via
// WebhookReceiver's HMAC signature check over the raw request body (hence
// main.ts's `rawBody: true`), using the same API key/secret pair issued to
// LiveKit for this project — anyone without that secret cannot forge a valid
// signed event.
@Controller('webhooks')
export class LiveKitWebhookController {
    private readonly logger = new Logger(LiveKitWebhookController.name);
    private readonly receiver: WebhookReceiver;

    constructor(
        private readonly configService: ConfigService,
        private readonly liveKitWebhookService: LiveKitWebhookService,
    ) {
        this.receiver = new WebhookReceiver(
            this.configService.getLiveKitApiKey(),
            this.configService.getLiveKitApiSecret(),
        );
    }

    @Post('livekit')
    @HttpCode(200)
    async handleWebhook(@Req() req: Request): Promise<{ received: boolean }> {
        const authHeader = req.headers['authorization'];
        const rawBody = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : '';

        let event: Awaited<ReturnType<WebhookReceiver['receive']>>;
        try {
            event = await this.receiver.receive(rawBody, authHeader);
        } catch (error) {
            throw new UnauthorizedException('Invalid LiveKit webhook signature');
        }

        try {
            const roomName = event.room?.name;
            const identity = event.participant?.identity;
            if (roomName && identity) {
                if (event.event === 'participant_left') {
                    await this.liveKitWebhookService.handleParticipantLeft(roomName, identity);
                } else if (event.event === 'participant_joined') {
                    await this.liveKitWebhookService.handleParticipantJoined(roomName, identity);
                }
            }
        } catch (error) {
            // Never fail the webhook response over our own processing error —
            // LiveKit would otherwise retry-storm an event we already understood.
            this.logger.error('Failed to process LiveKit webhook event', error as Error);
        }

        return { received: true };
    }
}
