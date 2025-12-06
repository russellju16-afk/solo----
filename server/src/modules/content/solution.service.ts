import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solution } from './entities/solution.entity';

@Injectable()
export class SolutionService {
  constructor(
    @InjectRepository(Solution) private solutionRepository: Repository<Solution>,
  ) {}

  // 构建查询条件
  private buildQueryBuilder(query: any) {
    const qb = this.solutionRepository.createQueryBuilder('solution')
      .orderBy('solution.sort_order', 'ASC');

    // 按标题搜索
    if (query.keyword) {
      qb.where('solution.title LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    // 按渠道类型筛选
    if (query.channel_type) {
      qb.andWhere('solution.channel_type = :channelType', { channelType: query.channel_type });
    }

    // 按启用状态筛选
    if (query.enabled !== undefined) {
      qb.andWhere('solution.enabled = :enabled', { enabled: query.enabled });
    }

    return qb;
  }

  // 获取解决方案列表（支持分页和筛选）
  async findAll(query: any): Promise<any> {
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

  // 根据ID获取解决方案详情
  async findOneById(id: number): Promise<Solution | undefined> {
    return this.solutionRepository.findOne({ where: { id } });
  }

  // 创建解决方案
  async create(createSolutionDto: any): Promise<any> {
    return this.solutionRepository.save(createSolutionDto);
  }

  // 更新解决方案
  async update(id: number, updateSolutionDto: any): Promise<Solution> {
    const solution = await this.findOneById(id);
    if (!solution) {
      throw new NotFoundException('解决方案不存在');
    }

    Object.assign(solution, updateSolutionDto);
    return this.solutionRepository.save(solution);
  }

  // 删除解决方案
  async delete(id: number): Promise<void> {
    const result = await this.solutionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('解决方案不存在');
    }
  }
}
