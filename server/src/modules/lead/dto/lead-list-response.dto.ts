export class LeadItemDto {
  id: number;
  name: string;
  companyName: string;
  phone: string;
  city?: string;
  channelType: string;
  interestedCategories: string[];
  monthlyVolumeSegment?: string;
  brandRequirement?: string;
  description?: string;
  productId?: string;
  source: string;
  status: string;
  ownerName?: string;
  createdAt: Date;
}

export class LeadListResponseDto {
  items: LeadItemDto[];
  total: number;
  page?: number;
  pageSize?: number;
}
