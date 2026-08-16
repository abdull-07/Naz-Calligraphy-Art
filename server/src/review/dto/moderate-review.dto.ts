import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReviewStatus } from '../../generated/prisma';

export class ModerateReviewDto {
    @IsEnum(ReviewStatus)
    status: ReviewStatus;

    @IsString()
    @IsOptional()
    adminReply?: string;
}