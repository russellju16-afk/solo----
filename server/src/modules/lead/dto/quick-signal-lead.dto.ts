import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class QuickSignalLeadDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['phone', 'wechat', 'email'])
  channel: 'phone' | 'wechat' | 'email';

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

