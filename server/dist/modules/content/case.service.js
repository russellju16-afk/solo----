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
exports.CaseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const case_entity_1 = require("./entities/case.entity");
let CaseService = class CaseService {
    constructor(caseRepository) {
        this.caseRepository = caseRepository;
    }
    buildQueryBuilder(query) {
        const qb = this.caseRepository.createQueryBuilder('case')
            .orderBy('case.published_at', 'DESC');
        if (query.keyword) {
            qb.where('case.customer_name LIKE :keyword', { keyword: `%${query.keyword}%` });
        }
        if (query.industry_type) {
            qb.andWhere('case.industry_type = :industryType', { industryType: query.industry_type });
        }
        if (query.status) {
            qb.andWhere('case.status = :status', { status: query.status });
        }
        return qb;
    }
    async findAll(query) {
        const page = parseInt(query.page || '1');
        const pageSize = parseInt(query.pageSize || '10');
        const qb = this.buildQueryBuilder(query);
        const [cases, total] = await qb
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return {
            data: cases,
            total,
            page,
            pageSize,
        };
    }
    async findOneById(id) {
        return this.caseRepository.findOne({ where: { id } });
    }
    async create(createCaseDto) {
        return this.caseRepository.save(createCaseDto);
    }
    async update(id, updateCaseDto) {
        const caseItem = await this.findOneById(id);
        if (!caseItem) {
            throw new common_1.NotFoundException('案例不存在');
        }
        Object.assign(caseItem, updateCaseDto);
        return this.caseRepository.save(caseItem);
    }
    async delete(id) {
        const result = await this.caseRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('案例不存在');
        }
    }
};
exports.CaseService = CaseService;
exports.CaseService = CaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(case_entity_1.Case)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CaseService);
//# sourceMappingURL=case.service.js.map