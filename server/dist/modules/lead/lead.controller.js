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
exports.LeadController = void 0;
const common_1 = require("@nestjs/common");
const lead_service_1 = require("./lead.service");
const lead_followup_service_1 = require("./lead-followup.service");
const passport_1 = require("@nestjs/passport");
const create_lead_dto_1 = require("./dto/create-lead.dto");
let LeadController = class LeadController {
    constructor(leadService, followupService) {
        this.leadService = leadService;
        this.followupService = followupService;
    }
    async create(createLeadDto) {
        const lead = await this.leadService.create(createLeadDto);
        return { success: true, id: lead.id };
    }
    async findAll(query) {
        return this.leadService.findAll(query);
    }
    async findOne(id) {
        return this.leadService.findOneById(Number(id));
    }
    async update(id, updateLeadDto) {
        return this.leadService.update(Number(id), updateLeadDto);
    }
    async delete(id) {
        return this.leadService.delete(Number(id));
    }
    async updateStatus(id, body) {
        return this.leadService.updateStatus(Number(id), body.status);
    }
    async export(query) {
        return this.leadService.export(query);
    }
    async getFollowups(id) {
        return this.followupService.findByLeadId(Number(id));
    }
    async createFollowup(id, createFollowupDto) {
        return this.followupService.create(Number(id), createFollowupDto);
    }
};
exports.LeadController = LeadController;
__decorate([
    (0, common_1.Post)('api/leads'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_dto_1.CreateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('api/admin/leads'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('api/admin/leads/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('api/admin/leads/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('api/admin/leads/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)('api/admin/leads/:id/status'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('api/admin/leads/export'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "export", null);
__decorate([
    (0, common_1.Get)('api/admin/leads/:id/followups'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getFollowups", null);
__decorate([
    (0, common_1.Post)('api/admin/leads/:id/followups'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "createFollowup", null);
exports.LeadController = LeadController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [lead_service_1.LeadService,
        lead_followup_service_1.LeadFollowupService])
], LeadController);
//# sourceMappingURL=lead.controller.js.map