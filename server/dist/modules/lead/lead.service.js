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
exports.LeadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("./entities/lead.entity");
const user_service_1 = require("../user/user.service");
const feishu_service_1 = require("../feishu/feishu.service");
let LeadService = class LeadService {
    constructor(leadRepository, userService, feishuService) {
        this.leadRepository = leadRepository;
        this.userService = userService;
        this.feishuService = feishuService;
    }
    buildQueryBuilder(query) {
        const qb = this.leadRepository.createQueryBuilder('lead')
            .leftJoinAndSelect('lead.owner', 'owner')
            .orderBy('lead.created_at', 'DESC');
        if (query.keyword) {
            qb.where('lead.name LIKE :keyword OR lead.company_name LIKE :keyword OR lead.phone LIKE :keyword', { keyword: `%${query.keyword}%` });
        }
        if (query.status) {
            qb.andWhere('lead.status = :status', { status: query.status });
        }
        if (query.channel_type) {
            qb.andWhere('lead.channel_type = :channelType', { channelType: query.channel_type });
        }
        if (query.owner_id) {
            qb.andWhere('lead.ownerId = :ownerId', { ownerId: query.owner_id });
        }
        if (query.date_from) {
            qb.andWhere('lead.created_at >= :dateFrom', { dateFrom: new Date(query.date_from) });
        }
        if (query.date_to) {
            qb.andWhere('lead.created_at <= :dateTo', { dateTo: new Date(query.date_to) });
        }
        if (query.interested_categories) {
            qb.andWhere('lead.interested_categories LIKE :categories', { categories: `%${query.interested_categories}%` });
        }
        return qb;
    }
    async findAll(query) {
        const page = parseInt(query.page || '1');
        const pageSize = parseInt(query.pageSize || '10');
        const qb = this.buildQueryBuilder(query);
        const [leads, total] = await qb
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return {
            data: leads,
            total,
            page,
            pageSize,
        };
    }
    async findOneById(id) {
        return this.leadRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
    }
    async create(createLeadDto) {
        const lead = this.leadRepository.create({
            ...createLeadDto,
            status: 'new',
        });
        const savedLead = await this.leadRepository.save(lead);
        try {
            await this.feishuService.sendLeadNotification(savedLead);
        }
        catch (error) {
            console.error('发送飞书线索通知失败:', error);
        }
        return savedLead;
    }
    async update(id, updateLeadDto) {
        const lead = await this.findOneById(id);
        if (!lead) {
            throw new common_1.NotFoundException('线索不存在');
        }
        if (updateLeadDto.owner_id) {
            const owner = await this.userService.findOneById(updateLeadDto.owner_id);
            if (!owner) {
                throw new common_1.NotFoundException('用户不存在');
            }
            lead.owner = owner;
            delete updateLeadDto.owner_id;
        }
        Object.assign(lead, updateLeadDto);
        return this.leadRepository.save(lead);
    }
    async delete(id) {
        const result = await this.leadRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('线索不存在');
        }
    }
    async updateStatus(id, status) {
        const lead = await this.findOneById(id);
        if (!lead) {
            throw new common_1.NotFoundException('线索不存在');
        }
        lead.status = status;
        return this.leadRepository.save(lead);
    }
    async export(query) {
        const qb = this.buildQueryBuilder(query);
        return qb.getMany();
    }
};
exports.LeadService = LeadService;
exports.LeadService = LeadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_service_1.UserService,
        feishu_service_1.FeishuService])
], LeadService);
//# sourceMappingURL=lead.service.js.map