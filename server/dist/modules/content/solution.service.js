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
exports.SolutionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const solution_entity_1 = require("./entities/solution.entity");
let SolutionService = class SolutionService {
    constructor(solutionRepository) {
        this.solutionRepository = solutionRepository;
    }
    buildQueryBuilder(query) {
        const qb = this.solutionRepository.createQueryBuilder('solution')
            .orderBy('solution.sort_order', 'ASC');
        if (query.keyword) {
            qb.where('solution.title LIKE :keyword', { keyword: `%${query.keyword}%` });
        }
        if (query.channel_type) {
            qb.andWhere('solution.channel_type = :channelType', { channelType: query.channel_type });
        }
        if (query.enabled !== undefined) {
            qb.andWhere('solution.enabled = :enabled', { enabled: query.enabled });
        }
        return qb;
    }
    async findAll(query) {
        const page = parseInt(query.page || '1');
        const pageSize = parseInt(query.pageSize || '10');
        const qb = this.buildQueryBuilder(query);
        const [solutions, total] = await qb
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return {
            data: solutions,
            total,
            page,
            pageSize,
        };
    }
    async findOneById(id) {
        return this.solutionRepository.findOne({ where: { id } });
    }
    async create(createSolutionDto) {
        return this.solutionRepository.save(createSolutionDto);
    }
    async update(id, updateSolutionDto) {
        const solution = await this.findOneById(id);
        if (!solution) {
            throw new common_1.NotFoundException('解决方案不存在');
        }
        Object.assign(solution, updateSolutionDto);
        return this.solutionRepository.save(solution);
    }
    async delete(id) {
        const result = await this.solutionRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('解决方案不存在');
        }
    }
};
exports.SolutionService = SolutionService;
exports.SolutionService = SolutionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(solution_entity_1.Solution)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SolutionService);
//# sourceMappingURL=solution.service.js.map