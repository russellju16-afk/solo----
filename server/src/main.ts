import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3002;
  
  // 全局路由前缀，所有接口统一以 /api 开头
  app.setGlobalPrefix('api');
  
  // 全局管道，用于验证请求体
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // 静态托管上传文件：/uploads/**
  const uploadDir = join(process.cwd(), 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });
  app.useStaticAssets(uploadDir, { prefix: '/uploads' });

  // 启用 CORS（支持 env 配置 ALLOWED_ORIGINS=xxx,yyy）
  const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'];
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const effectiveOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (effectiveOrigins.includes('*')) return callback(null, true);
      if (effectiveOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
