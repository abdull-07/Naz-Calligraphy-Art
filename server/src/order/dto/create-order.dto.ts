import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingType } from 'generated/prisma/enums';

// ─── Nested: single line item ────────────────────────────────────────────────

export class CreateOrderItemDto {
  @IsInt()
  variantId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

// ─── Nested: inline shipping address (guest / new address) ───────────────────

export class ShippingAddressDto {
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
  country?: string; // defaults to "Pakistan" in the service
}

// ─── Main DTO ────────────────────────────────────────────────────────────────

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  /** Existing saved address (logged-in users) */
  @IsInt()
  @IsOptional()
  addressId?: number;

  /** Inline address for guest checkout or a new address */
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsOptional()
  shippingAddress?: ShippingAddressDto;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  couponCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  customerNote?: string;

  @IsEnum(ShippingType)
  @IsOptional()
  shippingType?: ShippingType;

  /** Required for guest orders (no JWT) */
  @IsEmail()
  @IsOptional()
  guestEmail?: string;
}
