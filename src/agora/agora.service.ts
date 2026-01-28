import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder } from 'agora-token';

@Injectable()
export class AgoraService {
    private readonly appId: string;
    private readonly appCertificate: string;

    constructor(private readonly configService: ConfigService) {
        this.appId = this.configService.getAgoraAppId();
        this.appCertificate = this.configService.getAgoraCertificate();
    }

    /**
     * Generate Agora RTC Token for video/audio
     * ⭐ Using UID=0 to allow any UID to join with this token
     */
    generateRtcToken(
        channelName: string,
        uid: string,
        role: 'publisher' | 'subscriber' = 'publisher'
    ): { token: string; expiresAt: Date } {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpireTime = currentTimestamp + (24 * 3600); // 24 hours

        // ⭐ KEY CHANGE: Use UID=0 for wildcard token (allows any UID to use this token)
        const numericUid = 0; // This allows both "123" and "123_screen" to use the same token

        const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

        const token = RtcTokenBuilder.buildTokenWithUid(
            this.appId,
            this.appCertificate,
            channelName,
            numericUid,
            agoraRole,
            privilegeExpireTime,
            privilegeExpireTime
        );

        return {
            token,
            expiresAt: new Date(privilegeExpireTime * 1000)
        };
    }

    /**
     * Generate Agora RTM Token for messaging
     */
    generateRtmToken(uid: string): { token: string; expiresAt: Date } {
        const expireInSeconds = 24 * 60 * 60; // 24 hours

        const token = RtmTokenBuilder.buildToken(
            this.appId,
            this.appCertificate,
            uid,
            expireInSeconds
        );

        return {
            token,
            expiresAt: new Date(Date.now() + expireInSeconds * 1000),
        };
    }

    /**
     * Generate unique channel name for exam
     */
    generateChannelName(examId: string): string {
        return `exam_${examId}_${Date.now()}`;
    }

    /**
     * Generate unique numeric UID for user
     */
    generateUid(userId: string, role: 'faculty' | 'student'): string {
        const hash = this.hashStringToNumber(userId);
        const rolePrefix = role === 'faculty' ? 1 : 2;
        const timestamp = Date.now() % 1000000;
        const numericUid = `${rolePrefix}${hash}${timestamp}`;
        return numericUid;
    }

    /**
     * Hash string to a 4-digit number
     */
    private hashStringToNumber(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString().slice(0, 4).padStart(4, '0');
    }

    /**
     * Generate both RTC and RTM tokens
     */
    generateTokens(
        channelName: string,
        uid: string,
        role: 'publisher' | 'subscriber' = 'publisher'
    ): {
        rtcToken: string;
        rtmToken: string;
        expiresAt: Date;
    } {
        const rtc = this.generateRtcToken(channelName, uid, role);
        const rtm = this.generateRtmToken(uid);

        return {
            rtcToken: rtc.token,
            rtmToken: rtm.token,
            expiresAt: rtc.expiresAt
        };
    }

    isTokenExpired(expiresAt: Date): boolean {
        return new Date() > expiresAt;
    }

    getTokenRemainingTime(expiresAt: Date): number {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        return Math.max(0, Math.floor((expiry - now) / 1000));
    }
}