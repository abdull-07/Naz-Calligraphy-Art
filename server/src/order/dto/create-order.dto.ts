import {
    IsInt,
    IsString,
    IsOptional,
    IsEnum,
    IsArray,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingType, PaymentProvider } from '../../generated/prisma';

export class OrderItemDto {
    @IsInt()
    variantId: number;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsInt()
    addressId: number;

    @IsEnum(ShippingType)
    @IsOptional()
    shippingType?: ShippingType;

    @IsEnum(PaymentProvider)
    paymentProvider: PaymentProvider;

    @IsString()
    @IsOptional()
    couponCode?: string;

    @IsString()
    @IsOptional()
    customerNote?: string;
}