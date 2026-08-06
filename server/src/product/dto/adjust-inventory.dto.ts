import {
    IsInt,
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';

export class AdjustInventoryDto {
    @IsInt()
    variantId: number;

    @IsInt()
    changeQty: number; // positive = add, negative = remove

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    reason: string;
}