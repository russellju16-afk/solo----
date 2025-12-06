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
exports.BannerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const banner_entity_1 = require("./entities/banner.entity");
let BannerService = class BannerService {
    constructor(bannerRepository) {
        this.bannerRepository = bannerRepository;
    }
    async findAll(query = {}) {
        const qb = this.bannerRepository.createQueryBuilder('banner')
            .orderBy('banner.sort_order', 'ASC');
        if (query.position) {
            qb.where('banner.position = :position', { position: query.position });
        }
        if (query.enabled !== undefined) {
            qb.andWhere('banner.enabled = :enabled', { enabled: query.enabled });
        }
        return qb.getMany();
    }
    async findOneById(id) {
        return this.bannerRepository.findOne({ where: { id } });
    }
    async create(createBannerDto) {
        return this.bannerRepository.save(createBannerDto);
    }
    async update(id, updateBannerDto) {
        const banner = await this.findOneById(id);
        if (!banner) {
            throw new common_1.NotFoundException('轮播图不存在');
        }
        Object.assign(banner, updateBannerDto);
        return this.bannerRepository.save(banner);
    }
    async delete(id) {
        const result = await this.bannerRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('轮播图不存在');
        }
    }
    async updateEnabled(id, enabled) {
        const banner = await this.findOneById(id);
        if (!banner) {
            throw new common_1.NotFoundException('轮播图不存在');
        }
        banner.enabled = enabled;
        return this.bannerRepository.save(banner);
    }
};
exports.BannerService = BannerService;
exports.BannerService = BannerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(banner_entity_1.Banner)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BannerService);
//# sourceMappingURL=banner.service.js.map