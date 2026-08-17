import {
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MaxLength(50)
  label: string; // e.g. "Home", "Office"

  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsString()
  @MaxLength(255)
  street: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  province: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}