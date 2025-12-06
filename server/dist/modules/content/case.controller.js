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
exports.CaseController = void 0;
const common_1 = require("@nestjs/common");
const case_service_1 = require("./case.service");
const passport_1 = require("@nestjs/passport");
let CaseController = class CaseController {
    constructor(caseService) {
        this.caseService = caseService;
    }
    async findAll(query) {
        query.status = 'published';
        return this.caseService.findAll(query);
    }
    async findOne(id) {
        return this.caseService.findOneById(Number(id));
    }
    async adminFindAll(query) {
        return this.caseService.findAll(query);
    }
    async adminFindOne(id) {
        return this.caseService.findOneById(Number(id));
    }
    async create(createCaseDto) {
        return this.caseService.create(createCaseDto);
    }
    async update(id, updateCaseDto) {
        return this.caseService.update(Number(id), updateCaseDto);
    }
    async delete(id) {
        return this.caseService.delete(Number(id));
    }
};
exports.CaseController = CaseController;
__decorate([
    (0, common_1.Get)('api/cases'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CaseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('api/cases/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CaseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('api/admin/cases'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CaseController.prototype, "adminFindAll", null);
__decorate([
    (0, common_1.Get)('api/admin/cases/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CaseController.prototype, "adminFindOne", null);
__decorate([
    (0, common_1.Post)('api/admin/cases'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CaseController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('api/admin/cases/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CaseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('api/admin/cases/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CaseController.prototype, "delete", null);
exports.CaseController = CaseController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [case_service_1.CaseService])
], CaseController);
//# sourceMappingURL=case.controller.js.map