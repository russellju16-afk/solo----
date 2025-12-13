import { BadRequestException, Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // 匿名上报（前台用）
  @Post('track')
  async track(@Body() dto: TrackEventDto, @Req() req: Request) {
    return this.analyticsService.trackPublic(dto, req);
  }

  // 后台聚合（后台看板用）
  @Get('admin/analytics/overview')
  @UseGuards(AuthGuard('jwt'))
  async overview(@Query('startAt') startAt?: string, @Query('endAt') endAt?: string) {
    if (!startAt || !endAt) {
      throw new BadRequestException('startAt/endAt are required');
    }
    if (!DATE_RE.test(startAt) || !DATE_RE.test(endAt)) {
      throw new BadRequestException('invalid date format');
    }
    return this.analyticsService.getOverview({ startAt, endAt });
  }
}
