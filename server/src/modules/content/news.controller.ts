import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // 前台接口：获取新闻列表（无需认证）
  @Get('api/news')
  async findAll(@Query() query: any) {
    // 前台默认只显示已发布的新闻
    query.status = 'published';
    return this.newsService.findAll(query);
  }

  // 前台接口：根据ID获取新闻详情（无需认证）
  @Get('api/news/:id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOneById(Number(id));
  }

  // 后台接口：获取新闻列表（需要认证）
  @Get('api/admin/news')
  @UseGuards(AuthGuard('jwt'))
  async adminFindAll(@Query() query: any) {
    return this.newsService.findAll(query);
  }

  // 后台接口：根据ID获取新闻详情（需要认证）
  @Get('api/admin/news/:id')
  @UseGuards(AuthGuard('jwt'))
  async adminFindOne(@Param('id') id: string) {
    return this.newsService.findOneById(Number(id));
  }

  // 后台接口：创建新闻（需要认证）
  @Post('api/admin/news')
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createNewsDto: any) {
    return this.newsService.create(createNewsDto);
  }

  // 后台接口：更新新闻（需要认证）
  @Put('api/admin/news/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateNewsDto: any) {
    return this.newsService.update(Number(id), updateNewsDto);
  }

  // 后台接口：删除新闻（需要认证）
  @Delete('api/admin/news/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.newsService.delete(Number(id));
  }
}
