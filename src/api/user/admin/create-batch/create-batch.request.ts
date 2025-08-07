import { Transform } from "class-transformer";
import { IsNumber, Max, Min, ValidateBy, ValidationOptions } from "class-validator";

// validator for course duration
function IsValidCourseDuration(validationOptions?: ValidationOptions) {
    return ValidateBy(
        {
            name: 'isValidCourseDuration',
            validator: {
                validate(value: any, args: any) {
                    const obj = args.object as CreateBatchRequest;
                    if (!obj.startYear || !obj.endYear) return false;

                    const duration = obj.endYear - obj.startYear;
                    const allowedDurations = [2, 3, 4, 5];
                    return allowedDurations.includes(duration);
                },
                defaultMessage() {
                    return 'Course duration must be 2, 3, 4, or 5 years. Current duration is $value years.';
                }
            }
        },
        validationOptions
    );
}

export class CreateBatchRequest {

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(2000, { message: 'Start year must be at least 2000' })
    @Max(2050, { message: 'Start year cannot be more than 2050' })
    startYear: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(2000, { message: 'End year must be at least 2000' })
    @Max(2055, { message: 'End year cannot be more than 2055' })
    @IsValidCourseDuration({
        message: 'Course duration must be 2, 3, 4, or 5 years only'
    })
    endYear: number;

}