import {
    IsInt, IsString, IsOptional, IsEnum,
    IsArray, ValidateNested, Min, IsEmail,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ShippingType, PaymentProvider } from '../../generated/prisma'

export class OrderItemDto {
    @IsInt()
    variantId: number

    @IsInt()
    @Min(1)
    quantity: number
}

export class GuestAddressDto {
    @IsString()
    fullName: string

    @IsEmail()
    email: string

    @IsString()
    phone: string

    @IsString()
    street: string

    @IsString()
    city: string

    @IsString()
    province: string

    @IsOptional()
    @IsString()
    postalCode?: string

    @IsString()
    country: string
}

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[]

    @IsOptional()
    @IsInt()
    addressId?: number

    @IsOptional()
    @ValidateNested()
    @Type(() => GuestAddressDto)
    guestInfo?: GuestAddressDto   // ← for guest checkout

    @IsEnum(ShippingType)
    @IsOptional()
    shippingType?: ShippingType

    @IsEnum(PaymentProvider)
    paymentProvider: PaymentProvider

    @IsString()
    @IsOptional()
    couponCode?: string

    @IsString()
    @IsOptional()
    customerNote?: string

    @IsString()
    @IsOptional()
    courierName?: string           // ← TCS, Pakistan Post, Leopards

    @IsOptional()
    shippingFee?: number           // ← calculated on frontend
}