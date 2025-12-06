"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeishuModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const feishu_config_entity_1 = require("./entities/feishu-config.entity");
const feishu_service_1 = require("./feishu.service");
const feishu_controller_1 = require("./feishu.controller");
let FeishuModule = class FeishuModule {
};
exports.FeishuModule = FeishuModule;
exports.FeishuModule = FeishuModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([feishu_config_entity_1.FeishuConfig])],
        controllers: [feishu_controller_1.FeishuController],
        providers: [feishu_service_1.FeishuService],
        exports: [feishu_service_1.FeishuService],
    })
], FeishuModule);
//# sourceMappingURL=feishu.module.js.map