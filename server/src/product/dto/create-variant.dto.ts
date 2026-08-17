import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @MaxLength(100)
  label: string; // e.g. "1 Piece", "5 Pieces", "10 Pieces"

  @IsString()
  @IsOptional()
  @MaxLength(100)
  sku?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  comparePrice?: number;

  @IsInt()
  @Min(0)
  stockQty: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  lowStockAlert?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}