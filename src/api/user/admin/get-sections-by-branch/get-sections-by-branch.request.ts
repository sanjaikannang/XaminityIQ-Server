import { IsNotEmpty, IsString } from "class-validator";

export class GetSectionsByBranchRequest {

    @IsNotEmpty()
    @IsString()
    branchId: string;

}