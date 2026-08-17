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
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { BlogQueryDto } from './dto/blog-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../generated/prisma';

@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    // GET /api/v1/blog
    @Get()
    findAll(@Query() query: BlogQueryDto) {
        return this.blogService.findAll(query);
    }

    // GET /api/v1/blog/categories
    @Get('categories')
    getCategories() {
        return this.blogService.getCategories();
    }

    // GET /api/v1/blog/tags
    @Get('tags')
    getTags() {
        return this.blogService.getTags();
    }

    // GET /api/v1/blog/:slug
    @Get(':slug')
    findBySlug(@Param('slug') slug: string) {
        return this.blogService.findBySlug(slug);
    }

    // ─── ADMIN — POSTS ───────────────────────────────────────────────────────

    // GET /api/v1/blog/admin/all
    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    findAllAdmin(@Query() query: BlogQueryDto) {
        return this.blogService.findAllAdmin(query);
    }

    // POST /api/v1/blog
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @HttpCode(HttpStatus.CREATED)
    create(
        @Body() dto: CreateBlogPostDto,
        @CurrentUser('id') authorId: number,
    ) {
        return this.blogService.create(dto, authorId);
    }

    // PATCH /api/v1/blog/:id
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBlogPostDto,
        @CurrentUser('id') userId: number,
    ) {
        return this.blogService.update(id, dto, userId);
    }

    // DELETE /api/v1/blog/:id
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.blogService.remove(id);
    }

    // PATCH /api/v1/blog/:id/publish
    @Patch(':id/publish')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    publish(@Param('id', ParseIntPipe) id: number) {
        return this.blogService.publish(id);
    }

    // PATCH /api/v1/blog/:id/unpublish
    @Patch(':id/unpublish')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    unpublish(@Param('id', ParseIntPipe) id: number) {
        return this.blogService.unpublish(id);
    }

    // ─── ADMIN — CATEGORIES ──────────────────────────────────────────────────

    // POST /api/v1/blog/categories
    @Post('categories')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @HttpCode(HttpStatus.CREATED)
    createCategory(@Body() dto: CreateBlogCategoryDto) {
        return this.blogService.createCategory(dto);
    }

    // PATCH /api/v1/blog/categories/:id
    @Patch('categories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    updateCategory(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateBlogCategoryDto,
    ) {
        return this.blogService.updateCategory(id, dto);
    }

    // DELETE /api/v1/blog/categories/:id
    @Delete('categories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    removeCategory(@Param('id', ParseIntPipe) id: number) {
        return this.blogService.removeCategory(id);
    }

    // ─── ADMIN — TAGS ────────────────────────────────────────────────────────

    // POST /api/v1/blog/tags
    @Post('tags')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @HttpCode(HttpStatus.CREATED)
    createTag(@Body('name') name: string) {
        return this.blogService.createTag(name);
    }

    // DELETE /api/v1/blog/tags/:id
    @Delete('tags/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    removeTag(@Param('id', ParseIntPipe) id: number) {
        return this.blogService.removeTag(id);
    }
}