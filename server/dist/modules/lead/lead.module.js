"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lead_entity_1 = require("./entities/lead.entity");
const lead_followup_entity_1 = require("./entities/lead-followup.entity");
const lead_service_1 = require("./lead.service");
const lead_controller_1 = require("./lead.controller");
const lead_followup_service_1 = require("./lead-followup.service");
const user_module_1 = require("../user/user.module");
const feishu_module_1 = require("../feishu/feishu.module");
let LeadModule = class LeadModule {
};
exports.LeadModule = LeadModule;
exports.LeadModule = LeadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([lead_entity_1.Lead, lead_followup_entity_1.LeadFollowup]),
            user_module_1.UserModule,
            feishu_module_1.FeishuModule,
        ],
        controllers: [lead_controller_1.LeadController],
        providers: [lead_service_1.LeadService, lead_followup_service_1.LeadFollowupService],
        exports: [lead_service_1.LeadService],
    })
], LeadModule);
//# sourceMappingURL=lead.module.js.map