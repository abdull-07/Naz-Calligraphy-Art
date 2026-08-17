import { IsEmail, IsString, IsOptional, MaxLength } from 'class-validator';

export class SubscribeDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;
}