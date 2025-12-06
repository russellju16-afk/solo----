import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, QueryBuilder } from 'typeorm';
import { News } from './entities/news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private newsRepository: Repository<News>,
  ) {}

  // 构建查询条件
  private buildQueryBuilder(query: any) {
    const qb = this.newsRepository.createQueryBuilder('news')
      .orderBy('news.published_at', 'DESC');

    // 按标题搜索
    if (query.keyword) {
      qb.where('news.title LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    // 按分类筛选
    if (query.category) {
      qb.andWhere('news.category = :category', { category: query.category });
    }

    // 按状态筛选
    if (query.status) {
      qb.andWhere('news.status = :status', { status: query.status });
    }

    return qb;
  }

  // 获取新闻列表（支持分页和筛选）
  async findAll(query: any): Promise<any> {
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

  // 根据ID获取新闻详情
  async findOneById(id: number): Promise<News | undefined> {
    return this.newsRepository.findOne({ where: { id } });
  }

  // 创建新闻
  async create(createNewsDto: any): Promise<any> {
    return this.newsRepository.save(createNewsDto);
  }

  // 更新新闻
  async update(id: number, updateNewsDto: any): Promise<News> {
    const news = await this.findOneById(id);
    if (!news) {
      throw new NotFoundException('新闻不存在');
    }

    Object.assign(news, updateNewsDto);
    return this.newsRepository.save(news);
  }

  // 删除新闻
  async delete(id: number): Promise<void> {
    const result = await this.newsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('新闻不存在');
    }
  }
}
