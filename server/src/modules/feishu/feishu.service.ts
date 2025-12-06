import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeishuConfig } from './entities/feishu-config.entity';
import axios from 'axios';

@Injectable()
export class FeishuService {
  private readonly logger = new Logger(FeishuService.name);

  constructor(
    @InjectRepository(FeishuConfig) private feishuConfigRepo: Repository<FeishuConfig>,
  ) {}

  // 获取飞书配置
  async getConfig(): Promise<FeishuConfig> {
    const config = await this.feishuConfigRepo.findOne({ where: {} });
    if (!config) {
      // 如果没有配置，返回默认配置
      return this.feishuConfigRepo.save({
        enabled: false,
        lead_notification_enabled: true,
        operation_notification_enabled: false,
      });
    }
    return config;
  }

  // 更新飞书配置
  async updateConfig(configData: Partial<FeishuConfig>): Promise<FeishuConfig> {
    const existingConfig = await this.getConfig();
    return this.feishuConfigRepo.save({
      ...existingConfig,
      ...configData,
    });
  }

  // 测试飞书连接
  async testConnection(): Promise<boolean> {
    const config = await this.getConfig();
    if (!config.enabled || !config.webhook_url) {
      throw new Error('飞书集成未启用或Webhook URL未配置');
    }

    try {
      const testMessage = {
        msg_type: 'text',
        content: {
          text: '飞书连接测试成功',
        },
      };

      await axios.post(config.webhook_url, testMessage);
      return true;
    } catch (error) {
      this.logger.error('飞书连接测试失败:', error.message);
      throw new Error(`飞书连接测试失败: ${error.message}`);
    }
  }

  // 发送飞书消息
  async sendMessage(message: string): Promise<boolean> {
    const config = await this.getConfig();
    if (!config.enabled || !config.webhook_url) {
      return false;
    }

    try {
      const payload = {
        msg_type: 'text',
        content: {
          text: message,
        },
      };

      await axios.post(config.webhook_url, payload);
      this.logger.log('飞书消息发送成功');
      return true;
    } catch (error) {
      this.logger.error('飞书消息发送失败:', error.message);
      return false;
    }
  }

  // 发送线索通知
  async sendLeadNotification(lead: any): Promise<boolean> {
    const config = await this.getConfig();
    if (!config.enabled || !config.lead_notification_enabled || !config.webhook_url) {
      return false;
    }

    try {
      const title = '【新官网线索】' + (lead.companyName || lead.company_name || lead.name);

      const channelMap: Record<string, string> = {
        university: '高校',
        group_catering: '团餐公司',
        social_restaurant: '社会餐饮',
        supermarket: '商超',
        food_factory: '食品厂',
        community_group_buying: '社区团购平台',
        online_platform: '线上平台',
        other: '其他',
      };

      const channelType = lead.channelType || lead.channel_type;
      const channelLabel = channelMap[channelType] ?? channelType;

      const textLines = [
        `来源：${lead.source}`,
        `渠道类型：${channelLabel}`,
        `姓名：${lead.name}`,
        `公司：${lead.companyName || lead.company_name || '未知'}`,
        `电话：${lead.phone}`,
        lead.city ? `城市：${lead.city}` : '',
        lead.productId || lead.product_id ? `关联产品ID：${lead.productId || lead.product_id}` : '',
        (lead.interestedCategories || lead.interested_categories)?.length
          ? `意向品类：${(lead.interestedCategories || lead.interested_categories).join(', ')}`
          : '',
        (lead.monthlyVolumeSegment || lead.monthly_volume_segment) ? `月采购量区间：${lead.monthlyVolumeSegment || lead.monthly_volume_segment}` : '',
        (lead.brandRequirement || lead.brand_requirement) ? `品牌/规格需求：${lead.brandRequirement || lead.brand_requirement}` : '',
        lead.description ? `需求描述：${lead.description}` : '',
      ].filter(Boolean);

      const payload = {
        msg_type: 'text',
        content: {
          text: `${title}\n` + textLines.join('\n'),
        },
      };

      await axios.post(config.webhook_url, payload);
      this.logger.log('线索飞书通知发送成功');
      return true;
    } catch (error) {
      this.logger.error('线索飞书通知发送失败:', error.message);
      return false;
    }
  }

  // 发送操作日志通知
  async sendOperationLogNotification(log: any): Promise<boolean> {
    const config = await this.getConfig();
    if (!config.enabled || !config.operation_notification_enabled || !config.webhook_url) {
      return false;
    }

    try {
      const message = `【操作日志通知】\n用户：${log.username}\n操作：${log.action}\n描述：${log.description}\nIP：${log.ip_address}\n时间：${new Date(log.created_at).toLocaleString()}`;

      const payload = {
        msg_type: 'text',
        content: {
          text: message,
        },
      };

      await axios.post(config.webhook_url, payload);
      this.logger.log('操作日志飞书通知发送成功');
      return true;
    } catch (error) {
      this.logger.error('操作日志飞书通知发送失败:', error.message);
      return false;
    }
  }
}