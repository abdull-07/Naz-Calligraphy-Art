import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';

export class CalculateShippingDto {
  @IsString()
  country: string; // e.g. "PK", "AE"

  @IsNumber()
  @Min(0)
  @IsOptional()
  weightKg?: number; // for PER_KG rate type

  @IsArray()
  @IsOptional()
  productIds?: number[]; // to check local shipping only restrictions
}