import { IsInt, IsEnum } from 'class-validator';
import { PaymentProvider } from '../../generated/prisma';

export class InitiatePaymentDto {
    @IsInt()
    orderId: number;

    @IsEnum(PaymentProvider)
    provider: PaymentProvider;
}