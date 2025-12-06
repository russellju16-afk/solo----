import { IsString, IsNotEmpty, IsOptional, IsArray, IsString as IsStringEach } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  @IsNotEmpty()
  channelType: string; // 前端传 ChannelType 字符串

  @IsOptional()
  @IsArray()
  @IsStringEach()
  interestedCategories?: string[];

  @IsOptional()
  @IsString()
  monthlyVolumeSegment?: string;

  @IsOptional()
  @IsString()
  brandRequirement?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  @IsNotEmpty()
  source: string;
}