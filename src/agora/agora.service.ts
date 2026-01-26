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
     * Using the new 'agora-token' package
     */
    generateRtcToken(
        channelName: string,
        uid: string,
        role: 'publisher' | 'subscriber' = 'publisher'
    ): { token: string; expiresAt: Date } {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpireTime = currentTimestamp + (24 * 3600); // 24 hours

        // Convert string UID to number for RTC (Agora requires numeric UID)
        const numericUid = parseInt(uid) || 0;

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
     * Using the new 'agora-token' package
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
     * Agora RTC requires numeric UIDs
     */
    generateUid(userId: string, role: 'faculty' | 'student'): string {
        // Generate a numeric UID from userId hash
        // Using a simple hash to convert userId to number
        const hash = this.hashStringToNumber(userId);
        const rolePrefix = role === 'faculty' ? 1 : 2;
        const timestamp = Date.now() % 1000000; // Last 6 digits of timestamp

        // Create numeric UID: rolePrefix(1 digit) + hash(4 digits) + timestamp(6 digits)
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
            hash = hash & hash; // Convert to 32-bit integer
        }
        // Return absolute value as 4-digit string
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

    /**
     * Validate if a token is expired
     */
    isTokenExpired(expiresAt: Date): boolean {
        return new Date() > expiresAt;
    }

    /**
     * Get remaining token validity in seconds
     */
    getTokenRemainingTime(expiresAt: Date): number {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        return Math.max(0, Math.floor((expiry - now) / 1000));
    }
}