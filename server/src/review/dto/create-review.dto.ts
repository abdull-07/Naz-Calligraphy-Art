import {
    IsInt,
    IsString,
    IsOptional,
    Min,
    Max,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    productId: number;

    @IsInt()
    @IsOptional()
    orderId?: number;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsOptional()
    @MaxLength(150)
    title?: string;

    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    body: string;
}