import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { CaseService } from './case.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  // 前台接口：获取案例列表（无需认证）
  @Get('api/cases')
  async findAll(@Query() query: any) {
    // 前台默认只显示已发布的案例
    query.status = 'published';
    return this.caseService.findAll(query);
  }

  // 前台接口：根据ID获取案例详情（无需认证）
  @Get('api/cases/:id')
  async findOne(@Param('id') id: string) {
    return this.caseService.findOneById(Number(id));
  }

  // 后台接口：获取案例列表（需要认证）
  @Get('api/admin/cases')
  @UseGuards(AuthGuard('jwt'))
  async adminFindAll(@Query() query: any) {
    return this.caseService.findAll(query);
  }

  // 后台接口：根据ID获取案例详情（需要认证）
  @Get('api/admin/cases/:id')
  @UseGuards(AuthGuard('jwt'))
  async adminFindOne(@Param('id') id: string) {
    return this.caseService.findOneById(Number(id));
  }

  // 后台接口：创建案例（需要认证）
  @Post('api/admin/cases')
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createCaseDto: any) {
    return this.caseService.create(createCaseDto);
  }

  // 后台接口：更新案例（需要认证）
  @Put('api/admin/cases/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateCaseDto: any) {
    return this.caseService.update(Number(id), updateCaseDto);
  }

  // 后台接口：删除案例（需要认证）
  @Delete('api/admin/cases/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.caseService.delete(Number(id));
  }
}
