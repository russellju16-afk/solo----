import { BadRequestException, Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, Req, Res } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadFollowupService } from './lead-followup.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QuickSignalLeadDto } from './dto/quick-signal-lead.dto';
import { Response } from 'express';
import { LeadListResponseDto } from './dto/lead-list-response.dto';
import { ExportLeadsQueryDto } from './dto/export-leads-query.dto';
import * as ExcelJS from 'exceljs';

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

  // 后台接口：导出线索（需要认证）
  @Get('admin/leads/export')
  @UseGuards(AuthGuard('jwt'))
  async export(@Res() res: Response, @Query() query: ExportLeadsQueryDto) {
    if (query.date_from && query.date_to) {
      const from = new Date(query.date_from);
      const to = new Date(query.date_to);
      if (Number.isFinite(from.getTime()) && Number.isFinite(to.getTime()) && from > to) {
        throw new BadRequestException('date_from must be <= date_to');
      }
    }

    const leads = await this.leadService.export(query);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Leads');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '姓名', key: 'name', width: 14 },
      { header: '公司名称', key: 'companyName', width: 26 },
      { header: '手机号', key: 'phone', width: 16 },
      { header: '城市', key: 'city', width: 16 },
      { header: '渠道类型', key: 'channelType', width: 14 },
      { header: '意向品类', key: 'interestedCategories', width: 22 },
      { header: '月度采购量', key: 'monthlyVolumeSegment', width: 14 },
      { header: '来源', key: 'source', width: 12 },
      { header: '状态', key: 'status', width: 12 },
      { header: '负责人', key: 'ownerName', width: 12 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];

    const toArray = (value: any) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return value ? value.split(',') : [];
      return [];
    };

    leads.forEach((lead: any) => {
      sheet.addRow({
        id: lead.id,
        name: lead.name,
        companyName: lead.companyName ?? lead.company_name ?? '',
        phone: lead.phone ?? '',
        city: lead.city ?? '',
        channelType: lead.channelType ?? lead.channel_type ?? '',
        interestedCategories: toArray(lead.interestedCategories ?? lead.interested_categories).join('/'),
        monthlyVolumeSegment: lead.monthlyVolumeSegment ?? lead.monthly_volume_segment ?? '',
        source: lead.source ?? '',
        status: lead.status ?? '',
        ownerName: lead.owner?.name ?? '',
        createdAt: lead.createdAt ?? lead.created_at ?? '',
      });
    });

    const now = new Date();
    const pad2 = (num: number) => String(num).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}_${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`;
    const filename = `leads_${stamp}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Cache-Control', 'no-store');
    return res.end(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));
  }

  // 后台接口：根据ID获取线索详情（需要认证）
  @Get('admin/leads/:id(\\d+)')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string) {
    return this.leadService.findOneById(Number(id));
  }

  // 后台接口：更新线索（需要认证）
  @Put('admin/leads/:id(\\d+)')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateLeadDto: any) {
    return this.leadService.update(Number(id), updateLeadDto);
  }

  // 后台接口：删除线索（需要认证）
  @Delete('admin/leads/:id(\\d+)')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.leadService.delete(Number(id));
  }

  // 后台接口：更新线索状态（需要认证）
  @Put('admin/leads/:id(\\d+)/status')
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.leadService.updateStatus(Number(id), body.status);
  }

  // 后台接口：获取线索的跟进记录（需要认证）
  @Get('admin/leads/:id(\\d+)/followups')
  @UseGuards(AuthGuard('jwt'))
  async getFollowups(@Param('id') id: string) {
    return this.followupService.findByLeadId(Number(id));
  }

  // 后台接口：创建线索跟进记录（需要认证）
  @Post('admin/leads/:id(\\d+)/followups')
  @UseGuards(AuthGuard('jwt'))
  async createFollowup(@Param('id') id: string, @Req() req, @Body() createFollowupDto: any) {
    return this.followupService.create(Number(id), req.user.userId, createFollowupDto);
  }
}
