import type { ChannelType, LeadStatus } from '../types/lead';

// 渠道类型映射
export const CHANNEL_LABEL_MAP: Record<ChannelType, string> = {
  university: '高校',
  group_catering: '团餐公司',
  social_restaurant: '社会餐饮',
  supermarket: '商超',
  food_factory: '食品厂',
  community_group_buying: '社区团购平台',
  online_platform: '线上平台',
  other: '其他',
};

// 状态标签映射
export const STATUS_LABEL_MAP: Record<LeadStatus, string> = {
  new: '未处理',
  processing: '跟进中',
  won: '已成交',
  lost: '已关闭',
};

// 状态颜色映射
export const STATUS_TAG_COLOR_MAP: Record<LeadStatus, string> = {
  new: 'blue',
  processing: 'orange',
  won: 'green',
  lost: 'default',
};

// 来源标签映射
export const SOURCE_LABEL_MAP: Record<string, string> = {
  home_short_form: '首页表单',
  product_detail: '产品详情',
  contact_page: '联系我们',
  website: '网站表单',
  phone: '电话咨询',
  wechat: '微信咨询',
  offline: '线下推广',
  partner: '合作伙伴推荐',
};

// 月度采购量区间映射
export const VOLUME_SEGMENT_MAP: Record<string, string> = {
  lt_5t: '小于5吨',
  between_5_20t: '5-20吨',
  gt_20t: '大于20吨',
};

// 品类映射
export const CATEGORY_LABEL_MAP: Record<string, string> = {
  rice: '大米',
  flour: '面粉',
  oil: '食用油',
  other: '其他',
};

// 手机号脱敏处理
export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
};

// 日期格式化
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
