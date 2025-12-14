import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const shouldLog = process.env.NODE_ENV !== 'production';
    if (shouldLog) this.logger.debug(`Login attempt: ${username}`);
    
    // 查找用户
    const user = await this.userService.findOneByUsername(username);
    
    if (!user) {
      if (shouldLog) this.logger.warn(`Login failed: user not found (${username})`);
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      if (shouldLog) this.logger.warn(`Login failed: invalid password (${username})`);
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status === 0) {
      if (shouldLog) this.logger.warn(`Login failed: user disabled (${username})`);
      throw new UnauthorizedException('用户已禁用');
    }

    // 生成JWT令牌
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role.name,
    };

    if (shouldLog) this.logger.debug(`Login successful: ${username}#${user.id}`);
    
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

  // 重置密码（需要已登录 & 校验旧密码）
  async resetPassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在或未登录');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('旧密码不正确');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.update(user.id, { password_hash: hashedPassword });

    return { message: '密码重置成功' };
  }
}
