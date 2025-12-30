import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from 'src/config/config.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

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

    constructor(private readonly configService: ConfigService) {            
        this.hmsApiUrl = this.configService.getHMSApiUrl();
        this.hmsAppAccessKey = this.configService.getHMSAppAccessKey();
        this.hmsAppSecret = this.configService.getHMSAppSecretKey();
    }

    // Create a room in 100ms
    async createRoom(roomName: string): Promise<HmsRoom> {
        try {
            const response = await axios.post(
                `${this.hmsApiUrl}/rooms`,
                {
                    name: roomName,
                    description: `Exam room: ${roomName}`,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.getManagementToken()}`,
                    },
                }
            );

            console.log("response", response)

            return {
                id: response.data.id,
                name: response.data.name,
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to create 100ms room');
        }
    }

    // Generate auth token for joining a room
    async generateAuthToken(
        roomId: string,
        userId: string,
        role: 'proctor' | 'student'
    ): Promise<HmsAuthToken> {
        try {
            const payload = {
                access_key: this.hmsAppAccessKey,
                room_id: roomId,
                user_id: userId,
                role: role,
                type: 'app',
                version: 2,
                iat: Math.floor(Date.now() / 1000),
                nbf: Math.floor(Date.now() / 1000),
            };

            const token = jwt.sign(payload, this.hmsAppSecret, {
                algorithm: 'HS256',
                expiresIn: '24h',
            });

            return { token };
        } catch (error) {
            throw new InternalServerErrorException('Failed to generate auth token');
        }
    }

    // Get management token for API calls
    private getManagementToken(): string {
        const payload = {
            access_key: this.hmsAppAccessKey,
            type: 'management',
            version: 2,
            iat: Math.floor(Date.now() / 1000),
            nbf: Math.floor(Date.now() / 1000),
        };

        return jwt.sign(payload, this.hmsAppSecret, {
            algorithm: 'HS256',
            expiresIn: '24h',
        });
    }
}