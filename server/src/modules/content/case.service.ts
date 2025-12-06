import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case) private caseRepository: Repository<Case>,
  ) {}

  // 构建查询条件
  private buildQueryBuilder(query: any) {
    const qb = this.caseRepository.createQueryBuilder('case')
      .orderBy('case.published_at', 'DESC');

    // 按客户名称搜索
    if (query.keyword) {
      qb.where('case.customer_name LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    // 按行业类型筛选
    if (query.industry_type) {
      qb.andWhere('case.industry_type = :industryType', { industryType: query.industry_type });
    }

    // 按状态筛选
    if (query.status) {
      qb.andWhere('case.status = :status', { status: query.status });
    }

    return qb;
  }

  // 获取案例列表（支持分页和筛选）
  async findAll(query: any): Promise<any> {
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

  // 根据ID获取案例详情
  async findOneById(id: number): Promise<Case | undefined> {
    return this.caseRepository.findOne({ where: { id } });
  }

  // 创建案例
  async create(createCaseDto: any): Promise<any> {
    return this.caseRepository.save(createCaseDto);
  }

  // 更新案例
  async update(id: number, updateCaseDto: any): Promise<Case> {
    const caseItem = await this.findOneById(id);
    if (!caseItem) {
      throw new NotFoundException('案例不存在');
    }

    Object.assign(caseItem, updateCaseDto);
    return this.caseRepository.save(caseItem);
  }

  // 删除案例
  async delete(id: number): Promise<void> {
    const result = await this.caseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('案例不存在');
    }
  }
}
