import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordDto } from './dto/reset-password.dto';

// Auth 路由统一暴露为 /api/auth/**
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reset-password')
  async resetPassword(@Req() req, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(req.user.userId, dto.oldPassword, dto.newPassword);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Body() req) {
    return req.user;
  }
}
