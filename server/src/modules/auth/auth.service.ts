import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    
    console.log('Login attempt:', { username });
    
    // 查找用户
    const user = await this.userService.findOneByUsername(username);
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('Login failed: User not found', { username });
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password', { username });
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status === 0) {
      console.log('Login failed: User disabled', { username, status: user.status });
      throw new UnauthorizedException('用户已禁用');
    }

    // 生成JWT令牌
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role.name,
    };

    console.log('Login successful:', { username, userId: user.id });
    
    return {
      token: this.jwtService.sign(payload),
      userInfo: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role.name,
      },
    };
  }

  // 重置密码
  async resetPassword(username: string, newPassword: string) {
    console.log('Reset password attempt:', { username });
    
    // 查找用户
    const user = await this.userService.findOneByUsername(username);
    if (!user) {
      console.log('Reset password failed: User not found', { username });
      throw new UnauthorizedException('用户不存在');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await this.userService.update(user.id, { password_hash: hashedPassword });
    
    console.log('Password reset successful:', { username, userId: user.id });
    
    return {
      message: '密码重置成功',
    };
  }
}
