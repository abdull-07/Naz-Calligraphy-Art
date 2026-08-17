import { IsString, IsNotEmpty } from 'class-validator';

export class ReplyContactDto {
    @IsString()
    @IsNotEmpty()
    reply: string;
}