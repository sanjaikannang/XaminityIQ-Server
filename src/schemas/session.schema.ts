import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    sessionId: string; 

    @Prop({ required: true })
    accessToken: string;

    @Prop({ required: true })
    refreshToken: string;

    @Prop({ required: true })
    userAgent: string;

    @Prop({ required: true })
    ipAddress: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: true })
    isActive: boolean;

    @Prop()
    lastActivity: Date;

}

export const SessionSchema = SchemaFactory.createForClass(Session);