import { AccessToken, RoomServiceClient, TrackSource } from 'livekit-server-sdk';
import { ConfigService } from 'src/config/config.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class LiveKitService {
    constructor(
        private readonly configService: ConfigService,
    ) { }


    // Generate a signed room-join JWT for a participant
    async generateToken(
        roomName: string,
        identity: string,
        name: string,
        grants: { canPublish: boolean; canSubscribe: boolean; canPublishData: boolean },
    ): Promise<string> {
        try {
            const at = new AccessToken(
                this.configService.getLiveKitApiKey(),
                this.configService.getLiveKitApiSecret(),
                { identity, name },
            );
            at.addGrant({
                roomJoin: true,
                room: roomName,
                canPublish: grants.canPublish,
                canSubscribe: grants.canSubscribe,
                canPublishData: grants.canPublishData,
            });
            return await at.toJwt();
        } catch (error) {
            throw new InternalServerErrorException(`Failed to generate LiveKit token: ${error.message}`);
        }
    }


    // Forcibly disconnect a participant from a room (faculty-initiated removal)
    async removeParticipant(roomName: string, identity: string): Promise<void> {
        try {
            const client = new RoomServiceClient(
                this.configService.getLiveKitUrl(),
                this.configService.getLiveKitApiKey(),
                this.configService.getLiveKitApiSecret(),
            );
            await client.removeParticipant(roomName, identity);
        } catch (error) {
            throw new InternalServerErrorException(`Failed to remove LiveKit participant: ${error.message}`);
        }
    }


    // Server-side mute of a participant's own published mic track (faculty-initiated) —
    // returns the resulting muted state, or null if the participant has no mic track
    // published yet (e.g. hasn't granted mic permission)
    async setParticipantMicMuted(roomName: string, identity: string, muted: boolean): Promise<boolean | null> {
        try {
            const client = new RoomServiceClient(
                this.configService.getLiveKitUrl(),
                this.configService.getLiveKitApiKey(),
                this.configService.getLiveKitApiSecret(),
            );
            const participant = await client.getParticipant(roomName, identity);
            const micTrack = participant.tracks.find((t) => t.source === TrackSource.MICROPHONE);
            if (!micTrack) return null;

            const updated = await client.mutePublishedTrack(roomName, identity, micTrack.sid, muted);
            return updated.muted;
        } catch (error) {
            throw new InternalServerErrorException(`Failed to update participant mic: ${error.message}`);
        }
    }

}
