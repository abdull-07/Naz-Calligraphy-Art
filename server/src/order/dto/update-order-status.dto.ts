import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus } from 'generated/prisma/enums';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  /** Optional note for status history, e.g. "Handed to TCS courier" */
  @IsString()
  @IsOptional()
  @MaxLength(255)
  note?: string;

  /** Tracking number — typically set when status = SHIPPED */
  @IsString()
  @IsOptional()
  @MaxLength(100)
  trackingNumber?: string;

  /** Courier name — typically set when status = SHIPPED */
  @IsString()
  @IsOptional()
  @MaxLength(100)
  courierName?: string;
}
