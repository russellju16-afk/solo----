import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, Req, Res } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadFollowupService } from './lead-followup.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QuickSignalLeadDto } from './dto/quick-signal-lead.dto';
import { Response } from 'express';
import { LeadListResponseDto } from './dto/lead-list-response.dto';

// 官网线索接口 /api/leads；管理后台线索接口 /api/admin/leads/**
@Controller()
export class LeadController {
  constructor(
    private readonly leadService: LeadService,
    private readonly followupService: LeadFollowupService,
  ) {}

  // 前台接口：提交线索（无需认证）
  @Post('leads')
  async create(@Body() createLeadDto: CreateLeadDto) {
    const lead = await this.leadService.create(createLeadDto);
    return { success: true, id: lead.id };
  }

  // 前台接口：快速行为线索（无需认证）
  @Post('leads/signal')
  async createSignalLead(@Body() dto: QuickSignalLeadDto, @Req() req) {
    return this.leadService.createSignalLead(dto, req);
  }

  // 后台接口：获取线索列表（需要认证）
  @Get('admin/leads')
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query() query: any): Promise<LeadListResponseDto> {
    return this.leadService.findAll(query);
  }

  // 后台接口：根据ID获取线索详情（需要认证）
  @Get('admin/leads/:id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string) {
    return this.leadService.findOneById(Number(id));
  }

  // 后台接口：更新线索（需要认证）
  @Put('admin/leads/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateLeadDto: any) {
    return this.leadService.update(Number(id), updateLeadDto);
  }

  // 后台接口：删除线索（需要认证）
  @Delete('admin/leads/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.leadService.delete(Number(id));
  }

  // 后台接口：更新线索状态（需要认证）
  @Put('admin/leads/:id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.leadService.updateStatus(Number(id), body.status);
  }

  // 后台接口：导出线索（需要认证）
  @Get('admin/leads/export')
  @UseGuards(AuthGuard('jwt'))
  async export(@Res() res: Response, @Query() query: any) {
    const leads = await this.leadService.export(query);
    const csv = this.toCsv(leads);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    return res.send(csv);
  }

  // 后台接口：获取线索的跟进记录（需要认证）
  @Get('admin/leads/:id/followups')
  @UseGuards(AuthGuard('jwt'))
  async getFollowups(@Param('id') id: string) {
    return this.followupService.findByLeadId(Number(id));
  }

  // 后台接口：创建线索跟进记录（需要认证）
  @Post('admin/leads/:id/followups')
  @UseGuards(AuthGuard('jwt'))
  async createFollowup(@Param('id') id: string, @Req() req, @Body() createFollowupDto: any) {
    return this.followupService.create(Number(id), req.user.userId, createFollowupDto);
  }

  private toCsv(leads: any[]): string {
    const headers = [
      'ID',
      '姓名',
      '公司名称',
      '手机号',
      '城市',
      '渠道类型',
      '意向品类',
      '月度采购量',
      '来源',
      '状态',
      '负责人',
      '创建时间',
    ];

    const rows = leads.map((lead) => {
      const interested = (lead.interestedCategories || lead.interested_categories || []).join('/');
      return [
        lead.id,
        lead.name,
        lead.companyName || lead.company_name || '',
        lead.phone || '',
        lead.city || '',
        lead.channelType || lead.channel_type || '',
        interested,
        lead.monthlyVolumeSegment || lead.monthly_volume_segment || '',
        lead.source || '',
        lead.status || '',
        lead.owner?.name || '',
        lead.created_at || lead.createdAt || '',
      ].map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
