import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeishuConfig } from './entities/feishu-config.entity';
import { FeishuService } from './feishu.service';
import { FeishuController } from './feishu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FeishuConfig])],
  controllers: [FeishuController],
  providers: [FeishuService],
  exports: [FeishuService],
})
export class FeishuModule {}
