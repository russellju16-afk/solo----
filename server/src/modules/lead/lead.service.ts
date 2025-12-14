/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { Lead } from './entities/lead.entity';
import { UserService } from '../user/user.service';
import { FeishuService } from '../feishu/feishu.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QuickSignalLeadDto } from './dto/quick-signal-lead.dto';
import { LeadItemDto, LeadListResponseDto } from './dto/lead-list-response.dto';
import { AnalyticsService } from '../analytics/analytics.service';

const SIGNAL_DEDUP_WINDOW_MS = 30 * 60 * 1000;
const SIGNAL_RATE_WINDOW_MS = 60 * 1000;
const SIGNAL_RATE_LIMIT = 20;
const ipCreateHistory = new Map<string, number[]>();

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    @InjectRepository(Lead) private leadRepository: Repository<Lead>,
    private userService: UserService,
    private feishuService: FeishuService,
    private analyticsService: AnalyticsService,
  ) {}

  private readIp(req: Request): string | null {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.trim()) return xff.split(',')[0].trim();
    if (Array.isArray(xff) && xff.length > 0) return String(xff[0]).split(',')[0].trim();
    const direct = (req.ip || (req.socket as any)?.remoteAddress) as string | undefined;
    return direct || null;
  }

  private hitRateLimit(ip: string) {
    const now = Date.now();
    const existing = ipCreateHistory.get(ip) || [];
    const next = existing.filter((ts) => now - ts < SIGNAL_RATE_WINDOW_MS);
    if (next.length >= SIGNAL_RATE_LIMIT) {
      throw new HttpException('rate_limit', HttpStatus.TOO_MANY_REQUESTS);
    }
    next.push(now);
    ipCreateHistory.set(ip, next);
  }

  // 构建查询条件
  private buildQueryBuilder(query: any) {
    const qb = this.leadRepository.createQueryBuilder('lead')
      .orderBy('lead.created_at', 'DESC')
      .where('1=1');

    // 按名称/公司/电话搜索
    if (query.keyword) {
      qb.andWhere(
        'lead.name LIKE :keyword OR lead.company_name LIKE :keyword OR lead.phone LIKE :keyword',
        { keyword: `%${query.keyword}%` },
      );
    }

    // 按状态筛选
    if (query.status) {
      qb.andWhere('lead.status = :status', { status: query.status });
    }

    // 按线索类型筛选（form/signal）
    const leadType = query.lead_type ?? query.leadType;
    if (leadType) {
      qb.andWhere('lead.lead_type = :leadType', { leadType });
    }

    // 按渠道类型筛选
    const channelType = query.channel_type ?? query.channelType;
    if (channelType) {
      qb.andWhere('lead.channel_type = :channelType', { channelType });
    }

    // 按触达渠道筛选（phone/wechat/email）
    const channel = query.channel;
    if (channel) {
      qb.andWhere('lead.channel = :channel', { channel });
    }

    // 按负责人筛选
    const ownerId = query.owner_id ?? query.ownerId;
    if (ownerId) {
      qb.andWhere('lead.owner_id = :ownerId', { ownerId: Number(ownerId) });
    }

    // 按时间段筛选
    const dateFrom = query.date_from ?? query.dateFrom;
    if (dateFrom) {
      qb.andWhere('lead.created_at >= :dateFrom', { dateFrom: new Date(dateFrom) });
    }
    const dateTo = query.date_to ?? query.dateTo;
    if (dateTo) {
      qb.andWhere('lead.created_at <= :dateTo', { dateTo: new Date(dateTo) });
    }

    // 按意向品类筛选
    const interestedCategories = query.interested_categories ?? query.interestedCategories;
    if (interestedCategories) {
      qb.andWhere('lead.interested_categories LIKE :categories', 
        { categories: `%${interestedCategories}%` });
    }

    return qb;
  }

  // 获取线索列表（支持分页和筛选）
  async findAll(query: any): Promise<LeadListResponseDto> {
    const page = parseInt(query.page || '1', 10);
    const pageSize = parseInt(query.pageSize || '10', 10);
    const qb = this.buildQueryBuilder(query)
      .leftJoin('lead.owner', 'owner')
      .select([
        'lead.id',
        'lead.leadType',
        'lead.channel',
        'lead.sessionId',
        'lead.pagePath',
        'lead.isContactable',
        'lead.name',
        'lead.companyName',
        'lead.phone',
        'lead.city',
        'lead.channelType',
        'lead.interestedCategories',
        'lead.monthlyVolumeSegment',
        'lead.brandRequirement',
        'lead.description',
        'lead.productId',
        'lead.source',
        'lead.status',
        'lead.createdAt',
        'owner.name',
      ]);

    const total = await qb.getCount();
    const rows = await qb
      .clone()
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany();

    const toArray = (value: any) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return value ? value.split(',') : [];
      return [];
    };

    const items: LeadItemDto[] = rows.map((row: any) => ({
      id: row.lead_id,
      leadType: row.lead_leadType ?? row.lead_lead_type,
      channel: row.lead_channel,
      sessionId: row.lead_sessionId ?? row.lead_session_id,
      pagePath: row.lead_pagePath ?? row.lead_page_path,
      isContactable: row.lead_isContactable ?? row.lead_is_contactable,
      name: row.lead_name,
      companyName: row.lead_companyName ?? row.lead_company_name,
      phone: row.lead_phone,
      city: row.lead_city,
      channelType: row.lead_channelType ?? row.lead_channel_type,
      interestedCategories: toArray(row.lead_interestedCategories ?? row.lead_interested_categories),
      monthlyVolumeSegment: row.lead_monthlyVolumeSegment ?? row.lead_monthly_volume_segment,
      brandRequirement: row.lead_brandRequirement ?? row.lead_brand_requirement,
      description: row.lead_description,
      productId: row.lead_productId ?? row.lead_product_id,
      source: row.lead_source,
      status: row.lead_status,
      createdAt: row.lead_createdAt ?? row.lead_created_at,
      ownerName: row.owner_name,
    }));

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  // 根据ID查找线索
  async findOneById(id: number): Promise<any> {
    const lead = await this.leadRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!lead) return undefined;
    const toArray = (value: any) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return value ? value.split(',') : [];
      return [];
    };
    return {
      id: lead.id,
      leadType: lead.leadType,
      channel: lead.channel,
      sessionId: lead.sessionId,
      pagePath: lead.pagePath,
      meta: lead.meta,
      isContactable: lead.isContactable,
      ip: lead.ip,
      ua: lead.ua,
      name: lead.name,
      companyName: lead.companyName,
      phone: lead.phone,
      city: lead.city,
      channelType: lead.channelType,
      interestedCategories: toArray(lead.interestedCategories),
      monthlyVolumeSegment: lead.monthlyVolumeSegment,
      brandRequirement: lead.brandRequirement,
      description: lead.description,
      productId: lead.productId,
      source: lead.source,
      status: lead.status,
      ownerId: lead.owner?.id,
      ownerName: lead.owner?.name,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }

  // 创建线索
  async create(createLeadDto: CreateLeadDto): Promise<any> {
    // 创建线索
    const lead = this.leadRepository.create({
      ...createLeadDto,
      status: 'new',
      leadType: 'form',
      isContactable: true,
      channel: 'unknown',
    });
    const savedLead = await this.leadRepository.save(lead);

    // 埋点：线索提交（后端双保险）
    try {
      await this.analyticsService.trackInternal('lead_submit', {
        source: savedLead.source,
        productId: savedLead.productId,
        channelType: savedLead.channelType,
      });
    } catch (error) {
      this.logger.warn(`写入 lead_submit 埋点失败: ${(error as any)?.message || error}`);
    }
    
    // 发送飞书通知
    try {
      await this.feishuService.sendLeadNotification(savedLead);
    } catch (error) {
      // 飞书通知失败不影响主线流程，只记录日志
      this.logger.error('发送飞书线索通知失败', error.stack || error.message);
    }
    
    return savedLead;
  }

  // 创建行为线索（无需认证）
  async createSignalLead(dto: QuickSignalLeadDto, req: Request) {
    const ua = (req.headers['user-agent'] as string | undefined) || null;
    const ip = this.readIp(req) || 'unknown';
    this.hitRateLimit(ip);

    const sessionId = dto.sessionId || null;
    const pagePath = dto.path || null;

    if (sessionId && pagePath) {
      const since = new Date(Date.now() - SIGNAL_DEDUP_WINDOW_MS);
      const existed = await this.leadRepository
        .createQueryBuilder('lead')
        .where('lead.lead_type = :leadType', { leadType: 'signal' })
        .andWhere('lead.session_id = :sessionId', { sessionId })
        .andWhere('lead.channel = :channel', { channel: dto.channel })
        .andWhere('lead.page_path = :pagePath', { pagePath })
        .andWhere('lead.created_at >= :since', { since })
        .orderBy('lead.created_at', 'DESC')
        .getOne();

      if (existed) {
        return { success: true, id: existed.id, dedup: true };
      }
    }

    const channelLabelMap: Record<string, string> = {
      phone: '电话直拨',
      wechat: '微信',
      email: '邮箱',
    };
    const channelLabel = channelLabelMap[dto.channel] || dto.channel;
    const placeholder = sessionId ? sessionId.slice(0, 6) : 'unknown';
    const description = `用户点击了${channelLabel}入口（页面：${pagePath || '-'}）`;

    const lead = this.leadRepository.create({
      leadType: 'signal',
      channel: dto.channel,
      sessionId,
      pagePath,
      meta: dto.meta ?? null,
      isContactable: false,
      ip: ip === 'unknown' ? null : ip,
      ua,
      status: 'new',
      name: `匿名访客-${placeholder}`,
      phone: '',
      companyName: null,
      source: 'signal',
      description,
    });

    const saved = await this.leadRepository.save(lead);
    return { success: true, id: saved.id, dedup: false };
  }

  // 更新线索
  async update(id: number, updateLeadDto: any): Promise<Lead> {
    const lead = await this.findOneById(id);
    if (!lead) {
      throw new NotFoundException('线索不存在');
    }

    // 如果更新负责人，需要查找用户
    if (updateLeadDto.owner_id) {
      const owner = await this.userService.findOneById(updateLeadDto.owner_id);
      if (!owner) {
        throw new NotFoundException('用户不存在');
      }
      lead.owner = owner;
      delete updateLeadDto.owner_id;
    }

    // 更新线索信息
    Object.assign(lead, updateLeadDto);

    return this.leadRepository.save(lead);
  }

  // 删除线索
  async delete(id: number): Promise<void> {
    const result = await this.leadRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('线索不存在');
    }
  }

  // 更新线索状态
  async updateStatus(id: number, status: string): Promise<Lead> {
    const lead = await this.findOneById(id);
    if (!lead) {
      throw new NotFoundException('线索不存在');
    }

    lead.status = status;
    return this.leadRepository.save(lead);
  }

  // 导出线索
  async export(query: any): Promise<Lead[]> {
    const qb = this.buildQueryBuilder(query)
      .leftJoinAndSelect('lead.owner', 'owner');
    return qb.getMany();
  }
}
