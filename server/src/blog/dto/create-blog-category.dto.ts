import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateBlogCategoryDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(120)
    slug?: string;
}