import { Controller, Post, Body, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserService } from '../user/user.service';

// Auth 路由统一暴露为 /api/auth/**
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

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
  async getProfile(@Req() req: any) {
    const user = await this.userService.findOneById(Number(req.user.userId));
    if (!user) {
      throw new UnauthorizedException('用户不存在或未登录');
    }
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role?.name || user.role,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
