import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from 'src/utils/enum';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: Object.values(UserRole) })
    role: UserRole;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop({ default: true })
    isFirstLogin: boolean;  // Force password change on first login

    @Prop({ default: false })
    isPasswordReset: boolean;

    @Prop()
    lastLogin: Date;

    @Prop()
    lastPasswordChange: Date;

    @Prop()
    accessToken: string;

    @Prop()
    refreshToken: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

}

export const UserSchema = SchemaFactory.createForClass(User);

// Define indexes
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ lastLogin: 1 });