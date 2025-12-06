import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadFollowupService } from './lead-followup.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller()
export class LeadController {
  constructor(
    private readonly leadService: LeadService,
    private readonly followupService: LeadFollowupService,
  ) {}

  // 前台接口：提交线索（无需认证）
  @Post('api/leads')
  async create(@Body() createLeadDto: CreateLeadDto) {
    const lead = await this.leadService.create(createLeadDto);
    return { success: true, id: lead.id };
  }

  // 后台接口：获取线索列表（需要认证）
  @Get('api/admin/leads')
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query() query: any) {
    return this.leadService.findAll(query);
  }

  // 后台接口：根据ID获取线索详情（需要认证）
  @Get('api/admin/leads/:id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string) {
    return this.leadService.findOneById(Number(id));
  }

  // 后台接口：更新线索（需要认证）
  @Put('api/admin/leads/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateLeadDto: any) {
    return this.leadService.update(Number(id), updateLeadDto);
  }

  // 后台接口：删除线索（需要认证）
  @Delete('api/admin/leads/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.leadService.delete(Number(id));
  }

  // 后台接口：更新线索状态（需要认证）
  @Put('api/admin/leads/:id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.leadService.updateStatus(Number(id), body.status);
  }

  // 后台接口：导出线索（需要认证）
  @Get('api/admin/leads/export')
  @UseGuards(AuthGuard('jwt'))
  async export(@Query() query: any) {
    return this.leadService.export(query);
  }

  // 后台接口：获取线索的跟进记录（需要认证）
  @Get('api/admin/leads/:id/followups')
  @UseGuards(AuthGuard('jwt'))
  async getFollowups(@Param('id') id: string) {
    return this.followupService.findByLeadId(Number(id));
  }

  // 后台接口：创建线索跟进记录（需要认证）
  @Post('api/admin/leads/:id/followups')
  @UseGuards(AuthGuard('jwt'))
  async createFollowup(@Param('id') id: string, @Body() createFollowupDto: any) {
    return this.followupService.create(Number(id), createFollowupDto);
  }
}
