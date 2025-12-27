import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Country } from 'src/utils/enum';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({
        type: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
        },
        required: true
    })
    name: {
        firstName: string;
        lastName: string;
    };

    @Prop({
        type: {
            phone: { type: String },
            address: {
                street: { type: String },
                city: { type: String },
                state: { type: String },
                zipCode: { type: String },
                country: { type: String, default: Country.INDIA }
            }
        }
    })
    contactInfo: {
        phone?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
        };
    }

}

export const AdminSchema = SchemaFactory.createForClass(Admin);