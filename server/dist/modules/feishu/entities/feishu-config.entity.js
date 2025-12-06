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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeishuConfig = void 0;
const typeorm_1 = require("typeorm");
let FeishuConfig = class FeishuConfig {
};
exports.FeishuConfig = FeishuConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FeishuConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, comment: '是否启用飞书集成' }),
    __metadata("design:type", Boolean)
], FeishuConfig.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, comment: '飞书App ID' }),
    __metadata("design:type", String)
], FeishuConfig.prototype, "app_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, comment: '飞书App Secret' }),
    __metadata("design:type", String)
], FeishuConfig.prototype, "app_secret", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true, comment: '飞书Webhook URL' }),
    __metadata("design:type", String)
], FeishuConfig.prototype, "webhook_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, comment: '飞书机器人名称' }),
    __metadata("design:type", String)
], FeishuConfig.prototype, "bot_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, comment: '飞书部门ID' }),
    __metadata("design:type", String)
], FeishuConfig.prototype, "department_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true, comment: '飞书用户ID列表，多个用逗号分隔' }),
    __metadata("design:type", String)
], FeishuConfig.prototype, "user_ids", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '消息模板' }),
    __metadata("design:type", String)
], FeishuConfig.prototype, "message_template", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, comment: '是否启用线索通知' }),
    __metadata("design:type", Boolean)
], FeishuConfig.prototype, "lead_notification_enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, comment: '是否启用操作通知' }),
    __metadata("design:type", Boolean)
], FeishuConfig.prototype, "operation_notification_enabled", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        comment: '创建时间',
    }),
    __metadata("design:type", Date)
], FeishuConfig.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        comment: '更新时间',
    }),
    __metadata("design:type", Date)
], FeishuConfig.prototype, "updated_at", void 0);
exports.FeishuConfig = FeishuConfig = __decorate([
    (0, typeorm_1.Entity)('feishu_config')
], FeishuConfig);
//# sourceMappingURL=feishu-config.entity.js.map