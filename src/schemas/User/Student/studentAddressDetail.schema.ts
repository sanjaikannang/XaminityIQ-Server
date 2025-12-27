import { Document } from "mongoose";
import { Country } from "src/utils/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type StudentAddressDetailDocument = StudentAddressDetail & Document;

@Schema({ _id: false })
export class Address {
    @Prop({ required: true })
    addressLine1: string;

    @Prop()
    addressLine2: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    state: string;

    @Prop({ required: true })
    pincode: string;

    @Prop({ required: true, default: Country.INDIA })
    country: string;
}

@Schema({ timestamps: true })
export class StudentAddressDetail {
    @Prop({ type: Address, required: true })
    currentAddress: Address;

    @Prop({ default: false })
    sameAsCurrent: boolean;

    @Prop({ type: Address })
    permanentAddress: Address;
}

export const StudentAddressDetailSchema = SchemaFactory.createForClass(StudentAddressDetail);