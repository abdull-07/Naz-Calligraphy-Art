import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Res,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // POST /api/v1/auth/register
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    // POST /api/v1/auth/login
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(dto, res);
    }

    // POST /api/v1/auth/logout
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    logout(
        @CurrentUser('id') userId: number,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.authService.logout(userId, res);
    }

    // POST /api/v1/auth/refresh
    @Post('refresh')
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    refresh(
        @CurrentUser('id') userId: number,
        @CurrentUser('refreshToken') refreshToken: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.authService.refreshTokens(userId, refreshToken, res);
    }

    // GET /api/v1/auth/verify-email/:token
    @Get('verify-email/:token')
    verifyEmail(@Param('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    // POST /api/v1/auth/forgot-password
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    // POST /api/v1/auth/reset-password
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    // GET /api/v1/auth/me
    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@CurrentUser() user: any) {
        return user;
    }
}