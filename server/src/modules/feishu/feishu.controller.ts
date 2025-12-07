import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { FeishuService } from './feishu.service';
import { AuthGuard } from '@nestjs/passport';

// Admin 飞书配置路由统一暴露为 /api/admin/feishu/**
@Controller('admin/feishu')
@UseGuards(AuthGuard('jwt'))
export class FeishuController {
  constructor(private readonly feishuService: FeishuService) {}

  // 获取飞书配置
  @Get('config')
  async getConfig() {
    return this.feishuService.getConfig();
  }

  // 更新飞书配置
  @Put('config')
  async updateConfig(@Body() configData: any) {
    return this.feishuService.updateConfig(configData);
  }

  // 测试飞书连接
  @Post('test')
  async testConnection() {
    await this.feishuService.testConnection();
    return { success: true, message: '飞书连接测试成功' };
  }
}
