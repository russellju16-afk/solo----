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
exports.SolutionController = void 0;
const common_1 = require("@nestjs/common");
const solution_service_1 = require("./solution.service");
const passport_1 = require("@nestjs/passport");
let SolutionController = class SolutionController {
    constructor(solutionService) {
        this.solutionService = solutionService;
    }
    async findAll(query) {
        if (query.enabled === undefined) {
            query.enabled = 1;
        }
        return this.solutionService.findAll(query);
    }
    async findOne(id) {
        return this.solutionService.findOneById(Number(id));
    }
    async adminFindAll(query) {
        return this.solutionService.findAll(query);
    }
    async adminFindOne(id) {
        return this.solutionService.findOneById(Number(id));
    }
    async create(createSolutionDto) {
        return this.solutionService.create(createSolutionDto);
    }
    async update(id, updateSolutionDto) {
        return this.solutionService.update(Number(id), updateSolutionDto);
    }
    async delete(id) {
        return this.solutionService.delete(Number(id));
    }
};
exports.SolutionController = SolutionController;
__decorate([
    (0, common_1.Get)('api/solutions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SolutionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('api/solutions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SolutionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('api/admin/solutions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SolutionController.prototype, "adminFindAll", null);
__decorate([
    (0, common_1.Get)('api/admin/solutions/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SolutionController.prototype, "adminFindOne", null);
__decorate([
    (0, common_1.Post)('api/admin/solutions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SolutionController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('api/admin/solutions/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SolutionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('api/admin/solutions/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SolutionController.prototype, "delete", null);
exports.SolutionController = SolutionController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [solution_service_1.SolutionService])
], SolutionController);
//# sourceMappingURL=solution.controller.js.map