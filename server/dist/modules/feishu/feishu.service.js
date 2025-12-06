"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FeishuService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeishuService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feishu_config_entity_1 = require("./entities/feishu-config.entity");
const axios_1 = require("axios");
let FeishuService = FeishuService_1 = class FeishuService {
    constructor(feishuConfigRepo) {
        this.feishuConfigRepo = feishuConfigRepo;
        this.logger = new common_1.Logger(FeishuService_1.name);
    }
    async getConfig() {
        const config = await this.feishuConfigRepo.findOne({ where: {} });
        if (!config) {
            return this.feishuConfigRepo.save({
                enabled: false,
                lead_notification_enabled: true,
                operation_notification_enabled: false,
            });
        }
        return config;
    }
    async updateConfig(configData) {
        const existingConfig = await this.getConfig();
        return this.feishuConfigRepo.save({
            ...existingConfig,
            ...configData,
        });
    }
    async testConnection() {
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
            await axios_1.default.post(config.webhook_url, testMessage);
            return true;
        }
        catch (error) {
            this.logger.error('飞书连接测试失败:', error.message);
            throw new Error(`飞书连接测试失败: ${error.message}`);
        }
    }
    async sendMessage(message) {
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
            await axios_1.default.post(config.webhook_url, payload);
            this.logger.log('飞书消息发送成功');
            return true;
        }
        catch (error) {
            this.logger.error('飞书消息发送失败:', error.message);
            return false;
        }
    }
    async sendLeadNotification(lead) {
        const config = await this.getConfig();
        if (!config.enabled || !config.lead_notification_enabled || !config.webhook_url) {
            return false;
        }
        try {
            const title = '【新官网线索】' + (lead.companyName || lead.company_name || lead.name);
            const channelMap = {
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
            await axios_1.default.post(config.webhook_url, payload);
            this.logger.log('线索飞书通知发送成功');
            return true;
        }
        catch (error) {
            this.logger.error('线索飞书通知发送失败:', error.message);
            return false;
        }
    }
    async sendOperationLogNotification(log) {
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
            await axios_1.default.post(config.webhook_url, payload);
            this.logger.log('操作日志飞书通知发送成功');
            return true;
        }
        catch (error) {
            this.logger.error('操作日志飞书通知发送失败:', error.message);
            return false;
        }
    }
};
exports.FeishuService = FeishuService;
exports.FeishuService = FeishuService = FeishuService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feishu_config_entity_1.FeishuConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FeishuService);
//# sourceMappingURL=feishu.service.js.map