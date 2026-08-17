import {
    IsString,
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsInt,
    Min,
    MaxLength,
} from 'class-validator';
import { ShippingRateType } from '../../generated/prisma';

export class CreateShippingZoneDto {
    // * e.g. "Pakistan Domestic", "Middle East"
    @IsString()
    @MaxLength(100)
    name: string;

    // * e.g. ["PK"] or ["AE", "SA", "QA"]
    @IsArray()
    @IsString({ each: true })
    countries: string[];

    @IsEnum(ShippingRateType)
    @IsOptional()
    rateType?: ShippingRateType;

    // * flat rate or base rate for per kg
    @IsNumber()
    @Min(0)
    @IsOptional()
    baseRate?: number;

    // * only for PER_KG rate type
    @IsNumber()
    @Min(0)
    @IsOptional()
    perKgRate?: number;

    // * estimated delivery min days
    @IsInt()
    @Min(0)
    @IsOptional()
    minDays?: number;

    // * estimated delivery max days
    @IsInt()
    @Min(0)
    @IsOptional()
    maxDays?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}