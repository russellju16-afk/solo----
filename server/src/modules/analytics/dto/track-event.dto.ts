import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export const ANALYTICS_EVENT_NAMES = [
  'product_view',
  'product_search',
  'product_filter',
  'product_compare_add',
  'product_compare_open',
  'contact_phone_click',
  'contact_wechat_open',
  'contact_email_copy',
  'lead_submit',
  'lead_followup',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export class TrackEventDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ANALYTICS_EVENT_NAMES)
  event: AnalyticsEventName;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

