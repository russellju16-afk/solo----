import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { username: string; newPassword: string }) {
    const { username, newPassword } = body;
    return this.authService.resetPassword(username, newPassword);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Body() req) {
    return req.user;
  }
}
