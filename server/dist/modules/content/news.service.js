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
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const news_entity_1 = require("./entities/news.entity");
let NewsService = class NewsService {
    constructor(newsRepository) {
        this.newsRepository = newsRepository;
    }
    buildQueryBuilder(query) {
        const qb = this.newsRepository.createQueryBuilder('news')
            .orderBy('news.published_at', 'DESC');
        if (query.keyword) {
            qb.where('news.title LIKE :keyword', { keyword: `%${query.keyword}%` });
        }
        if (query.category) {
            qb.andWhere('news.category = :category', { category: query.category });
        }
        if (query.status) {
            qb.andWhere('news.status = :status', { status: query.status });
        }
        return qb;
    }
    async findAll(query) {
        const page = parseInt(query.page || '1');
        const pageSize = parseInt(query.pageSize || '10');
        const qb = this.buildQueryBuilder(query);
        const [news, total] = await qb
            .limit(pageSize)
            .offset((page - 1) * pageSize)
            .getManyAndCount();
        return {
            data: news,
            total,
            page,
            pageSize,
        };
    }
    async findOneById(id) {
        return this.newsRepository.findOne({ where: { id } });
    }
    async create(createNewsDto) {
        return this.newsRepository.save(createNewsDto);
    }
    async update(id, updateNewsDto) {
        const news = await this.findOneById(id);
        if (!news) {
            throw new common_1.NotFoundException('新闻不存在');
        }
        Object.assign(news, updateNewsDto);
        return this.newsRepository.save(news);
    }
    async delete(id) {
        const result = await this.newsRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('新闻不存在');
        }
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(news_entity_1.News)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NewsService);
//# sourceMappingURL=news.service.js.map