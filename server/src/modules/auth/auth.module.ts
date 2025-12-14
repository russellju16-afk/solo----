import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('AuthModule');
        const expiresConfig = configService.get<string>('JWT_EXPIRES_IN') || '8h';
        const expiresIn = /^\d+$/.test(expiresConfig)
          ? parseInt(expiresConfig, 10)
          : expiresConfig;

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

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
