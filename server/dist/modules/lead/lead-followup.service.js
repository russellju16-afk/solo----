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
exports.LeadFollowupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_followup_entity_1 = require("./entities/lead-followup.entity");
const lead_entity_1 = require("./entities/lead.entity");
const user_service_1 = require("../user/user.service");
let LeadFollowupService = class LeadFollowupService {
    constructor(followupRepository, leadRepository, userService) {
        this.followupRepository = followupRepository;
        this.leadRepository = leadRepository;
        this.userService = userService;
    }
    async findByLeadId(leadId) {
        return this.followupRepository.find({
            where: { lead: { id: leadId } },
            relations: ['operator'],
            order: { created_at: 'DESC' },
        });
    }
    async create(leadId, createFollowupDto) {
        const lead = await this.leadRepository.findOne({ where: { id: leadId } });
        if (!lead) {
            throw new common_1.NotFoundException('线索不存在');
        }
        const operator = await this.userService.findOneById(createFollowupDto.operator_id);
        if (!operator) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const followup = this.followupRepository.create({
            lead,
            operator,
            note: createFollowupDto.note,
            status_after: createFollowupDto.status_after,
        });
        return this.followupRepository.save(followup);
    }
    async findOneById(id) {
        return this.followupRepository.findOne({
            where: { id },
            relations: ['operator'],
        });
    }
    async update(id, updateFollowupDto) {
        const followup = await this.findOneById(id);
        if (!followup) {
            throw new common_1.NotFoundException('跟进记录不存在');
        }
        if (updateFollowupDto.operator_id) {
            const operator = await this.userService.findOneById(updateFollowupDto.operator_id);
            if (!operator) {
                throw new common_1.NotFoundException('用户不存在');
            }
            followup.operator = operator;
        }
        Object.assign(followup, updateFollowupDto);
        return this.followupRepository.save(followup);
    }
    async delete(id) {
        const result = await this.followupRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('跟进记录不存在');
        }
    }
};
exports.LeadFollowupService = LeadFollowupService;
exports.LeadFollowupService = LeadFollowupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_followup_entity_1.LeadFollowup)),
    __param(1, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        user_service_1.UserService])
], LeadFollowupService);
//# sourceMappingURL=lead-followup.service.js.map