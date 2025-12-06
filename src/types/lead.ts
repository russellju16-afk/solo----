// 客户渠道类型
export type ChannelType =
  | 'university'              // 高校
  | 'group_catering'          // 团餐公司
  | 'social_restaurant'       // 社会餐饮
  | 'supermarket'             // 商超
  | 'food_factory'            // 食品厂
  | 'community_group_buying'  // 社区团购平台
  | 'online_platform'         // 线上平台（多多买菜、小象超市等）
  | 'other';

// 意向品类
export type CategoryInterest = 'rice' | 'flour' | 'oil' | 'other';

export type MonthlyVolumeSegment = 'lt_5t' | 'between_5_20t' | 'gt_20t';

export interface LeadPayload {
  name: string;
  companyName: string;
  phone: string;
  city?: string;
  channelType: ChannelType;
  interestedCategories: CategoryInterest[]; // 可多选
  monthlyVolumeSegment?: MonthlyVolumeSegment;
  brandRequirement?: string;
  description?: string;
  productId?: string;  // 如果来源于某个产品详情
  source: string;      // 线索来源，如 "home_short_form" / "contact_page" / "product_detail"
}