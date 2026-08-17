import {
    IsString,
    IsOptional,
    IsEnum,
    IsArray,
    IsInt,
    MaxLength,
    MinLength,
} from 'class-validator';
import { BlogStatus } from '../../generated/prisma';

export class CreateBlogPostDto {
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    title: string;

    @IsString()
    @IsOptional()
    @MaxLength(280)
    slug?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    excerpt?: string;

    @IsString()
    @MinLength(50)
    body: string;

    @IsString()
    @IsOptional()
    coverImage?: string;

    @IsEnum(BlogStatus)
    @IsOptional()
    status?: BlogStatus;

    @IsInt()
    categoryId: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsString()
    @IsOptional()
    @MaxLength(60)
    seoTitle?: string;

    @IsString()
    @IsOptional()
    @MaxLength(160)
    seoDescription?: string;
}