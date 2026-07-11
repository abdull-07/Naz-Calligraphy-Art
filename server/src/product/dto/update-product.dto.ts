import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// makes every field from CreateProductDto optional automatically
export class UpdateProductDto extends PartialType(CreateProductDto) {}