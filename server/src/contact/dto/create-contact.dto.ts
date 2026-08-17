import {
    IsString,
    IsEmail,
    IsNotEmpty,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateContactDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    subject: string;

    @IsString()
    @MinLength(10)
    @MaxLength(2000)
    message: string;
}