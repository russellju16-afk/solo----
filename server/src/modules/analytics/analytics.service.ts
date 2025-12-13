/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { TrackEventDto } from './dto/track-event.dto';
import { Lead } from '../lead/entities/lead.entity';

export interface AnalyticsOverviewParams {
  startAt: string;
  endAt: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const parseLocalDateStart = (date: string) => new Date(`${date}T00:00:00.000`);
const parseLocalDateEnd = (date: string) => new Date(`${date}T23:59:59.999`);

const safeNumber = (value: any) => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
};

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent) private eventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(Lead) private leadRepository: Repository<Lead>,
  ) {}

  private readIp(req: Request): string | null {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.trim()) return xff.split(',')[0].trim();
    if (Array.isArray(xff) && xff.length > 0) return String(xff[0]).split(',')[0].trim();
    const direct = (req.ip || (req.socket as any)?.remoteAddress) as string | undefined;
    return direct || null;
  }

  async trackPublic(dto: TrackEventDto, req: Request) {
    const ua = (req.headers['user-agent'] as string | undefined) || null;
    const ip = this.readIp(req);

    const record = this.eventRepository.create({
      event: dto.event,
      path: dto.path || null,
      referrer: dto.referrer || null,
      session_id: dto.sessionId || null,
      ip,
      ua,
      meta: dto.meta ?? null,
    });

    await this.eventRepository.save(record);
    return { success: true };
  }

  async trackInternal(event: string, meta?: Record<string, any>) {
    const record = this.eventRepository.create({
      event,
      path: null,
      referrer: null,
      session_id: null,
      ip: null,
      ua: null,
      meta: meta ?? null,
    });
    await this.eventRepository.save(record);
  }

  async getOverview(params: AnalyticsOverviewParams) {
    const { startAt, endAt } = params;
    if (!DATE_RE.test(startAt) || !DATE_RE.test(endAt)) {
      throw new Error('invalid date range');
    }

    const start = parseLocalDateStart(startAt);
    const end = parseLocalDateEnd(endAt);

    const countEvents = [
      'product_view',
      'product_search',
      'product_filter',
      'product_compare_add',
      'product_compare_open',
      'contact_phone_click',
      'contact_wechat_open',
      'contact_email_copy',
      'lead_followup',
    ];

    const eventRows = await this.eventRepository
      .createQueryBuilder('e')
      .select('e.event', 'event')
      .addSelect('COUNT(1)', 'count')
      .where('e.created_at >= :start AND e.created_at <= :end', { start, end })
      .andWhere('e.event IN (:...events)', { events: countEvents })
      .groupBy('e.event')
      .getRawMany();

    const eventCountMap = new Map<string, number>();
    eventRows.forEach((row: any) => {
      eventCountMap.set(row.event, safeNumber(row.count));
    });

    const views = eventCountMap.get('product_view') || 0;
    const searches = (eventCountMap.get('product_search') || 0) + (eventCountMap.get('product_filter') || 0);
    const compares = (eventCountMap.get('product_compare_add') || 0) + (eventCountMap.get('product_compare_open') || 0);
    const followups = eventCountMap.get('lead_followup') || 0;

    const quoteLeads = await this.leadRepository
      .createQueryBuilder('lead')
      .where('lead.created_at >= :start AND lead.created_at <= :end', { start, end })
      .andWhere('lead.lead_type = :leadType', { leadType: 'form' })
      .getCount();

    const signalClicks = await this.leadRepository
      .createQueryBuilder('lead')
      .where('lead.created_at >= :start AND lead.created_at <= :end', { start, end })
      .andWhere('lead.lead_type = :leadType', { leadType: 'signal' })
      .andWhere('lead.channel IN (:...channels)', { channels: ['phone', 'wechat', 'email'] })
      .getCount();

    const quoteConversionRate = views > 0 ? Number(((quoteLeads / views) * 100).toFixed(2)) : 0;

    const funnelStages = [
      { stage: '产品浏览', value: views },
      { stage: '筛选/搜索', value: searches },
      { stage: '添加对比', value: compares },
      { stage: '提交询价', value: quoteLeads },
      { stage: '销售跟进', value: followups },
    ];

    const funnel = funnelStages.map((item, index) => {
      if (index === 0) {
        return { ...item, percent: views > 0 ? 100 : 0 };
      }
      const percent = views > 0 ? Math.round((item.value / views) * 100) : 0;
      return { ...item, percent };
    });

    const signalChannelRows = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.channel', 'channel')
      .addSelect('COUNT(1)', 'count')
      .where('lead.created_at >= :start AND lead.created_at <= :end', { start, end })
      .andWhere('lead.lead_type = :leadType', { leadType: 'signal' })
      .andWhere('lead.channel IN (:...channels)', { channels: ['phone', 'wechat', 'email'] })
      .groupBy('lead.channel')
      .getRawMany();

    const signalChannelMap = new Map<string, number>();
    signalChannelRows.forEach((row: any) => {
      signalChannelMap.set(String(row.channel), safeNumber(row.count));
    });

    const channelRows = [
      { channel: '电话直拨', count: signalChannelMap.get('phone') || 0 },
      { channel: '微信', count: signalChannelMap.get('wechat') || 0 },
      { channel: '表单提交', count: quoteLeads },
      { channel: '邮件', count: signalChannelMap.get('email') || 0 },
    ];
    const channelTotal = channelRows.reduce((sum, item) => sum + item.count, 0);
    const channels = channelRows.map((item) => ({
      channel: item.channel,
      count: item.count,
      rate: channelTotal > 0 ? Number(((item.count / channelTotal) * 100).toFixed(1)) : 0,
    }));

    const filterEventRows = await this.eventRepository
      .createQueryBuilder('e')
      .select('e.event', 'event')
      .addSelect('e.meta', 'meta')
      .where('e.created_at >= :start AND e.created_at <= :end', { start, end })
      .andWhere('e.event IN (:...events)', { events: ['product_search', 'product_filter'] })
      .getRawMany();

    const buildFilterName = (meta: any) => {
      const keyword = meta?.keyword ? String(meta.keyword).trim() : '';
      const categoryId = meta?.categoryId ?? meta?.category_id;
      const presetName = meta?.presetName ? String(meta.presetName).trim() : '';
      const parts: string[] = [];
      if (presetName) parts.push(presetName);
      if (keyword) parts.push(`搜索：${keyword}`);
      if (categoryId !== undefined && categoryId !== null && String(categoryId).trim() !== '') {
        parts.push(`分类：${categoryId}`);
      }
      return parts.length ? parts.join(' + ') : '筛选/搜索';
    };

    const filterCountMap = new Map<string, number>();
    filterEventRows.forEach((row: any) => {
      let meta: any = null;
      if (row?.meta && typeof row.meta === 'string') {
        try {
          meta = JSON.parse(row.meta);
        } catch {
          meta = null;
        }
      } else {
        meta = row?.meta ?? null;
      }
      const name = buildFilterName(meta);
      filterCountMap.set(name, (filterCountMap.get(name) || 0) + 1);
    });

    const topFilters = Array.from(filterCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, usage]) => ({ name, usage }));

    return {
      range: { startAt, endAt },
      updatedAt: new Date().toISOString(),
      kpis: {
        views,
        searches,
        compares,
        quoteLeads,
        signalClicks,
        quoteConversionRate,
      },
      funnel,
      channels,
      topFilters,
    };
  }
}
