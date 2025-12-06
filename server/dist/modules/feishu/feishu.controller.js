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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeishuController = void 0;
const common_1 = require("@nestjs/common");
const feishu_service_1 = require("./feishu.service");
const passport_1 = require("@nestjs/passport");
let FeishuController = class FeishuController {
    constructor(feishuService) {
        this.feishuService = feishuService;
    }
    async getConfig() {
        return this.feishuService.getConfig();
    }
    async updateConfig(configData) {
        return this.feishuService.updateConfig(configData);
    }
    async testConnection() {
        await this.feishuService.testConnection();
        return { success: true, message: '飞书连接测试成功' };
    }
};
exports.FeishuController = FeishuController;
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FeishuController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FeishuController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Post)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FeishuController.prototype, "testConnection", null);
exports.FeishuController = FeishuController = __decorate([
    (0, common_1.Controller)('admin/feishu'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [feishu_service_1.FeishuService])
], FeishuController);
//# sourceMappingURL=feishu.controller.js.map