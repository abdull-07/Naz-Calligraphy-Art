import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) { }

    // ─── REGISTER ────────────────────────────────────────────────────────────

    async register(dto: RegisterDto) {
        // check email already exists
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) throw new ConflictException('Email already registered');

        // hash password
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // generate email verification token
        const emailVerifyToken = crypto.randomBytes(32).toString('hex');
        const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // create user
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                emailVerifyToken,
                emailVerifyExpiry,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
            },
        });

        // TODO: send verification email via EmailService

        return {
            message: 'Registration successful. Please verify your email.',
            user,
        };
    }

    // ─── LOGIN ───────────────────────────────────────────────────────────────

    async login(dto: LoginDto, res: any) {
        // find user
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // verify password
        const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // store hashed refresh token
        await this.storeRefreshToken(user.id, tokens.refreshToken);

        // set refresh token in HttpOnly cookie
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return {
            accessToken: tokens.accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        };
    }

    // ─── LOGOUT ──────────────────────────────────────────────────────────────

    async logout(userId: number, res: any) {
        // clear refresh token from DB
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });

        // clear cookie
        res.clearCookie('refresh_token');

        return { message: 'Logged out successfully' };
    }

    // ─── REFRESH TOKEN ───────────────────────────────────────────────────────

    async refreshTokens(userId: number, refreshToken: string, res: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Access denied');
        }

        // verify refresh token matches stored hash
        const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!tokenMatch) {
            throw new UnauthorizedException('Access denied');
        }

        // generate new tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // store new hashed refresh token
        await this.storeRefreshToken(user.id, tokens.refreshToken);

        // set new cookie
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { accessToken: tokens.accessToken };
    }

    // ─── VERIFY EMAIL ─────────────────────────────────────────────────────────

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                emailVerifyToken: token,
                emailVerifyExpiry: { gt: new Date() },
            },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerifyToken: null,
                emailVerifyExpiry: null,
            },
        });

        return { message: 'Email verified successfully' };
    }

    // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        // always return same message to prevent email enumeration
        if (!user) {
            return { message: 'If that email exists, a reset link has been sent.' };
        }

        const passwordResetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordResetToken, passwordResetExpiry },
        });

        // TODO: send reset email via EmailService

        return { message: 'If that email exists, a reset link has been sent.' };
    }

    // ─── RESET PASSWORD ───────────────────────────────────────────────────────

    async resetPassword(dto: ResetPasswordDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetToken: dto.token,
                passwordResetExpiry: { gt: new Date() },
            },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpiry: null,
                refreshToken: null, // invalidate all sessions
            },
        });

        return { message: 'Password reset successfully. Please login.' };
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private async generateTokens(userId: number, email: string, role: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(
                { sub: userId, email, role },
                {
                    secret: this.config.get('JWT_SECRET'),
                    expiresIn: this.config.get('JWT_EXPIRES_IN'),
                },
            ),
            this.jwt.signAsync(
                { sub: userId },
                {
                    secret: this.config.get('JWT_REFRESH_SECRET'),
                    expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
                },
            ),
        ]);

        return { accessToken, refreshToken };
    }

    private async storeRefreshToken(userId: number, refreshToken: string) {
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashed },
        });
    }
}