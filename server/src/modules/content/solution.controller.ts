import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { SolutionService } from './solution.service';
import { AuthGuard } from '@nestjs/passport';

// Public 路由 /api/solutions，Admin 路由 /api/admin/solutions/**
@Controller()
export class SolutionController {
  constructor(private readonly solutionService: SolutionService) {}

  // 前台接口：获取解决方案列表（无需认证）
  @Get('solutions')
  async findAll(@Query() query: any) {
    // 前台默认只显示启用的解决方案
    if (query.enabled === undefined) {
      query.enabled = 1;
    }
    return this.solutionService.findAll(query);
  }

  // 前台接口：根据ID获取解决方案详情（无需认证）
  @Get('solutions/:id')
  async findOne(@Param('id') id: string) {
    return this.solutionService.findOneById(Number(id));
  }

  // 后台接口：获取解决方案列表（需要认证）
  @Get('admin/solutions')
  @UseGuards(AuthGuard('jwt'))
  async adminFindAll(@Query() query: any) {
    return this.solutionService.findAll(query);
  }

  // 后台接口：根据ID获取解决方案详情（需要认证）
  @Get('admin/solutions/:id')
  @UseGuards(AuthGuard('jwt'))
  async adminFindOne(@Param('id') id: string) {
    return this.solutionService.findOneById(Number(id));
  }

  // 后台接口：创建解决方案（需要认证）
  @Post('admin/solutions')
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createSolutionDto: any) {
    return this.solutionService.create(createSolutionDto);
  }

  // 后台接口：更新解决方案（需要认证）
  @Put('admin/solutions/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateSolutionDto: any) {
    return this.solutionService.update(Number(id), updateSolutionDto);
  }

  // 后台接口：删除解决方案（需要认证）
  @Delete('admin/solutions/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.solutionService.delete(Number(id));
  }
}
