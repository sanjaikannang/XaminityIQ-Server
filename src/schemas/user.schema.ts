import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from 'src/utils/enum';

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

    @Prop({ default: false })
    isPasswordReset: boolean;

    @Prop()
    lastLogin: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);

// Define indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ lastLogin: 1 });