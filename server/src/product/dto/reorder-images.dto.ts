import { IsArray, IsInt, ArrayMinSize } from 'class-validator';

export class ReorderImagesDto {
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    imageIds: number[];
}