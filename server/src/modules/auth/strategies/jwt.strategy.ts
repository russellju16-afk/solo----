import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const logger = new Logger(JwtStrategy.name);
    const env = configService.get<string>('NODE_ENV') || process.env.NODE_ENV || 'development';
    const rawSecret = configService.get<string>('JWT_SECRET')?.trim();
    const insecureSecrets = new Set(['default_jwt_secret', 'your-secret-key-change-this-in-production']);
    const isSecretMissingOrInsecure = !rawSecret || insecureSecrets.has(rawSecret);
    const secret = isSecretMissingOrInsecure ? 'dev_jwt_secret' : rawSecret;

    if (isSecretMissingOrInsecure) {
      if (env === 'production') {
        throw new Error('JWT_SECRET is required in production');
      }
      logger.warn('JWT_SECRET 未配置或为默认占位值，已使用开发环境默认值（仅本地）');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
