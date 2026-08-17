import {
    IsString,
    IsBoolean,
    IsOptional,
    IsInt,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(120)
    slug?: string; // auto-generated if not provided

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsInt()
    @IsOptional()
    parentId?: number; // null = top-level category

    @IsInt()
    @IsOptional()
    @Min(0)
    sortOrder?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}