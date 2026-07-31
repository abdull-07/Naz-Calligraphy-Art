import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    // GET /api/v1/categories
    @Get()
    findAll() {
        return this.categoryService.findAll();
    }

    // GET /api/v1/categories/:slug
    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.categoryService.findBySlug(slug);
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    // GET /api/v1/categories/admin/all
    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    findAllAdmin() {
        return this.categoryService.findAllAdmin();
    }

    // POST /api/v1/categories
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateCategoryDto) {
        return this.categoryService.create(dto);
    }

    // PATCH /api/v1/categories/:id
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.categoryService.update(id, dto);
    }

    // DELETE /api/v1/categories/:id
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.remove(id);
    }

    // PATCH /api/v1/categories/reorder
    @Patch('reorder/bulk')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    reorder(@Body('ids') ids: number[]) {
        return this.categoryService.reorder(ids);
    }

    // PATCH /api/v1/categories/:id/toggle
    @Patch(':id/toggle')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    toggleActive(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.toggleActive(id);
    }
}