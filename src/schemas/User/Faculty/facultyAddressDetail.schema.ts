import { Country } from "src/utils/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type FacultyAddressDocument = FacultyAddress & Document;

@Schema({ _id: false })
export class AddressInfo {
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
export class FacultyAddress {
    @Prop({ type: AddressInfo, required: true })
    currentAddress: AddressInfo;

    @Prop({ default: false })
    sameAsCurrent: boolean;

    @Prop({ type: AddressInfo })
    permanentAddress: AddressInfo;
}

export const FacultyAddressSchema = SchemaFactory.createForClass(FacultyAddress);
