// 渠道类型
export type ChannelType = 
  | 'university'
  | 'group_catering'
  | 'social_restaurant'
  | 'supermarket'
  | 'food_factory'
  | 'community_group_buying'
  | 'online_platform'
  | 'other';

// 意向品类
export type CategoryInterest = 'rice' | 'flour' | 'oil' | 'other';

// 月度采购量区间
export type MonthlyVolumeSegment = 
  | 'lt_5t'
  | 'between_5_20t'
  | 'gt_20t';

// 线索状态
export type LeadStatus = 'new' | 'processing' | 'won' | 'lost';

// 线索列表项
export interface LeadListItem {
  id: number;
  name: string;
  companyName: string;
  phone: string;
  city?: string;
  channelType: ChannelType;
  interestedCategories?: CategoryInterest[];
  monthlyVolumeSegment?: MonthlyVolumeSegment;
  status: LeadStatus;
  ownerName?: string;       // 负责人姓名（后端可拼好）
  source: string;
  createdAt: string;        // ISO 字符串
}

// 线索详情
export interface LeadDetail extends LeadListItem {
  brandRequirement?: string;
  description?: string;
  productId?: string;
  followups?: LeadFollowup[];
}

// 跟进记录
export interface LeadFollowup {
  id: number;
  operatorName: string;
  note: string;
  statusAfter: LeadStatus;
  createdAt: string;
}

// 线索查询参数
export interface LeadQueryParams {
  page?: number;
  pageSize?: number;
  status?: LeadStatus | 'all';
  channelType?: ChannelType | 'all';
  ownerId?: number;
  keyword?: string;      // 姓名/公司/手机号模糊搜索
  dateFrom?: string;     // ISO 日期字符串
  dateTo?: string;
}

// 线索列表响应
export interface LeadsListResponse {
  items: LeadListItem[];
  total: number;
  page?: number;
  pageSize?: number;
}

// 更新线索 payload
export interface UpdateLeadPayload {
  status?: LeadStatus;
  ownerId?: number | null;
}

// 创建跟进记录 payload
export interface CreateFollowupPayload {
  note: string;
  statusAfter: LeadStatus;
}
