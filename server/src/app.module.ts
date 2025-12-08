import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { ContentModule } from './modules/content/content.module';
import { LeadModule } from './modules/lead/lead.module';
import { FeishuModule } from './modules/feishu/feishu.module';
import { CompanyModule } from './modules/company/company.module';
import { LoggingModule } from './modules/logging/logging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'solo_website.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UserModule,
    ProductModule,
    ContentModule,
    LeadModule,
    FeishuModule,
    CompanyModule,
    LoggingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
