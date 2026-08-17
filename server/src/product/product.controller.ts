import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../generated/prisma';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    // GET /api/v1/products
    @Get()
    findAll(@Query() query: ProductQueryDto) {
        return this.productService.findAll(query);
    }

    // GET /api/v1/products/:slug
    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.productService.findBySlug(slug);
    }

    // GET /api/v1/products/:id/variants
    @Get(':id/variants')
    findVariants(@Param('id', ParseIntPipe) id: number) {
        return this.productService.findVariants(id);
    }

    // GET /api/v1/products/:id/images
    @Get(':id/images')
    findImages(@Param('id', ParseIntPipe) id: number) {
        return this.productService.findImages(id);
    }

    // ─── ADMIN — PRODUCTS ────────────────────────────────────────────────────

    // GET /api/v1/products/admin/all
    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    findAllAdmin(@Query() query: ProductQueryDto) {
        return this.productService.findAllAdmin(query);
    }

    // POST /api/v1/products
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateProductDto) {
        return this.productService.create(dto);
    }

    // PATCH /api/v1/products/:id
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProductDto,
    ) {
        return this.productService.update(id, dto);
    }

    // DELETE /api/v1/products/:id
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productService.remove(id);
    }

    // ─── ADMIN — VARIANTS ────────────────────────────────────────────────────

    // POST /api/v1/products/:id/variants
    @Post(':id/variants')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @HttpCode(HttpStatus.CREATED)
    createVariant(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateVariantDto,
    ) {
        return this.productService.createVariant(id, dto);
    }

    // PATCH /api/v1/products/:id/variants/:variantId
    @Patch(':id/variants/:variantId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    updateVariant(
        @Param('id', ParseIntPipe) id: number,
        @Param('variantId', ParseIntPipe) variantId: number,
        @Body() dto: UpdateVariantDto,
    ) {
        return this.productService.updateVariant(id, variantId, dto);
    }

    // DELETE /api/v1/products/:id/variants/:variantId
    @Delete(':id/variants/:variantId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    removeVariant(
        @Param('id', ParseIntPipe) id: number,
        @Param('variantId', ParseIntPipe) variantId: number,
    ) {
        return this.productService.removeVariant(id, variantId);
    }

    // ─── ADMIN — IMAGES ──────────────────────────────────────────────────────

    // POST /api/v1/products/:id/images
    @Post(':id/images')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.CREATED)
    uploadImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body('altText') altText?: string,
        @Body('isPrimary') isPrimary?: string,
    ) {
        return this.productService.uploadImage(id, file, {
            altText,
            isPrimary: isPrimary === 'true',
        });
    }

    // PATCH /api/v1/products/:id/images/reorder
    @Patch(':id/images/reorder')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    reorderImages(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ReorderImagesDto,
    ) {
        return this.productService.reorderImages(id, dto);
    }

    // DELETE /api/v1/products/:id/images/:imageId
    @Delete(':id/images/:imageId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @HttpCode(HttpStatus.OK)
    removeImage(
        @Param('id', ParseIntPipe) id: number,
        @Param('imageId', ParseIntPipe) imageId: number,
    ) {
        return this.productService.removeImage(id, imageId);
    }

    // ─── ADMIN — INVENTORY ───────────────────────────────────────────────────

    // GET /api/v1/products/:id/inventory
    @Get(':id/inventory')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    getInventory(@Param('id', ParseIntPipe) id: number) {
        return this.productService.getInventory(id);
    }

    // PATCH /api/v1/products/:id/inventory
    @Patch(':id/inventory')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    adjustInventory(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AdjustInventoryDto,
        @CurrentUser('id') adminId: number,
    ) {
        return this.productService.adjustInventory(id, dto, adminId);
    }

    // GET /api/v1/products/:id/inventory/logs
    @Get(':id/inventory/logs')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    getInventoryLogs(@Param('id', ParseIntPipe) id: number) {
        return this.productService.getInventoryLogs(id);
    }
}