import { IsInt, IsString, IsOptional } from 'class-validator';

export class ConfirmBankTransferDto {
    @IsInt()
    orderId: number;

    @IsString()
    @IsOptional()
    referenceNumber?: string; // bank transaction reference

    @IsString()
    @IsOptional()
    note?: string;
}