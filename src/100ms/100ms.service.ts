import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from 'src/config/config.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ulid } from 'ulid';

export interface HmsRoom {
    id: string;
    name: string;
}

export interface HmsAuthToken {
    token: string;
}

@Injectable()
export class Hms100msService {
    private readonly hmsApiUrl: string;
    private readonly hmsAppAccessKey: string;
    private readonly hmsAppSecret: string;
    private readonly hmsTemplateId: string;

    constructor(private readonly configService: ConfigService) {
        this.hmsApiUrl = this.configService.getHMSApiUrl();
        this.hmsAppAccessKey = this.configService.getHMSAppAccessKey();
        this.hmsAppSecret = this.configService.getHMSAppSecretKey();
        this.hmsTemplateId = this.configService.getHMSTemplateId();
    }

    // Create a room in 100ms
    async createRoom(roomName: string): Promise<HmsRoom> {
        try {
            const managementToken = this.getManagementToken();
            console.log('Management Token:', managementToken);

            const response = await axios.post(
                `${this.hmsApiUrl}/rooms`,
                {
                    name: roomName,
                    description: `Exam room: ${roomName}`,
                    template_id: this.hmsTemplateId,
                    region: 'in'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${managementToken}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            console.log("response", response.data);

            return {
                id: response.data.id,
                name: response.data.name,
            };
        } catch (error) {
            // Log the actual error details
            console.error('100ms API Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    headers: error.config?.headers,
                }
            });

            throw new InternalServerErrorException(
                `Failed to create 100ms room: ${error.response?.data?.message || error.message}`
            );
        }
    }


    // Generate auth token for joining a room
    async generateAuthToken(
        roomId: string,
        userId: string,
        role: 'proctor' | 'student'
    ): Promise<HmsAuthToken> {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + 24 * 3600;

        try {
            const payload = {
                access_key: this.hmsAppAccessKey,
                room_id: roomId,
                user_id: userId,
                role: role,
                type: 'app',
                version: 2,
                exp: exp,
                jti: ulid()
            };

            const token = jwt.sign(payload, this.hmsAppSecret);

            return { token };
        } catch (error) {
            throw new InternalServerErrorException('Failed to generate auth token');
        }
    }

    // Get management token for API calls
    private getManagementToken(): string {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + 24 * 3600;

        const payload = {
            access_key: this.hmsAppAccessKey,
            type: 'management',
            version: 2,
            iat: now,
            exp: exp,
            jti: ulid()
        };

        return jwt.sign(payload, this.hmsAppSecret);
    }

}