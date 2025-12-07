import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { BannerService } from './banner.service';
import { AuthGuard } from '@nestjs/passport';

// Public 路由 /api/banners，Admin 路由 /api/admin/banners/**
@Controller()
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  // 前台接口：获取轮播图列表（无需认证，只返回启用的）
  @Get('banners')
  async findAll(@Query() query: any) {
    // 前台默认只返回启用的轮播图
    if (query.enabled === undefined) {
      query.enabled = 1;
    }
    return this.bannerService.findAll(query);
  }

  // 后台接口：获取所有轮播图（需要认证）
  @Get('admin/banners')
  @UseGuards(AuthGuard('jwt'))
  async adminFindAll(@Query() query: any) {
    return this.bannerService.findAll(query);
  }

  // 后台接口：根据ID获取轮播图详情（需要认证）
  @Get('admin/banners/:id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string) {
    return this.bannerService.findOneById(Number(id));
  }

  // 后台接口：创建轮播图（需要认证）
  @Post('admin/banners')
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createBannerDto: any) {
    return this.bannerService.create(createBannerDto);
  }

  // 后台接口：更新轮播图（需要认证）
  @Put('admin/banners/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateBannerDto: any) {
    return this.bannerService.update(Number(id), updateBannerDto);
  }

  // 后台接口：删除轮播图（需要认证）
  @Delete('admin/banners/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.bannerService.delete(Number(id));
  }

  // 后台接口：更新轮播图状态（需要认证）
  @Put('admin/banners/:id/enabled')
  @UseGuards(AuthGuard('jwt'))
  async updateEnabled(@Param('id') id: string, @Body() body: { enabled: number }) {
    return this.bannerService.updateEnabled(Number(id), body.enabled);
  }
}
