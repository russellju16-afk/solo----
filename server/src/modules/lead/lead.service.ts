import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { UserService } from '../user/user.service';
import { FeishuService } from '../feishu/feishu.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    @InjectRepository(Lead) private leadRepository: Repository<Lead>,
    private userService: UserService,
    private feishuService: FeishuService,
  ) {}

  // 构建查询条件
  private buildQueryBuilder(query: any) {
    const qb = this.leadRepository.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.owner', 'owner')
      .orderBy('lead.created_at', 'DESC');

    // 按名称/公司/电话搜索
    if (query.keyword) {
      qb.where('lead.name LIKE :keyword OR lead.company_name LIKE :keyword OR lead.phone LIKE :keyword', 
        { keyword: `%${query.keyword}%` });
    }

    // 按状态筛选
    if (query.status) {
      qb.andWhere('lead.status = :status', { status: query.status });
    }

    // 按渠道类型筛选
    if (query.channel_type) {
      qb.andWhere('lead.channel_type = :channelType', { channelType: query.channel_type });
    }

    // 按负责人筛选
    if (query.owner_id) {
      qb.andWhere('lead.ownerId = :ownerId', { ownerId: query.owner_id });
    }

    // 按时间段筛选
    if (query.date_from) {
      qb.andWhere('lead.created_at >= :dateFrom', { dateFrom: new Date(query.date_from) });
    }
    if (query.date_to) {
      qb.andWhere('lead.created_at <= :dateTo', { dateTo: new Date(query.date_to) });
    }

    // 按意向品类筛选
    if (query.interested_categories) {
      qb.andWhere('lead.interested_categories LIKE :categories', 
        { categories: `%${query.interested_categories}%` });
    }

    return qb;
  }

  // 获取线索列表（支持分页和筛选）
  async findAll(query: any): Promise<any> {
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

  // 根据ID查找线索
  async findOneById(id: number): Promise<Lead | undefined> {
    return this.leadRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  // 创建线索
  async create(createLeadDto: CreateLeadDto): Promise<any> {
    // 创建线索
    const lead = this.leadRepository.create({
      ...createLeadDto,
      status: 'new',
    });
    const savedLead = await this.leadRepository.save(lead);
    
    // 发送飞书通知
    try {
      await this.feishuService.sendLeadNotification(savedLead);
    } catch (error) {
      // 飞书通知失败不影响主线流程，只记录日志
      this.logger.error('发送飞书线索通知失败', error.stack || error.message);
    }
    
    return savedLead;
  }

  // 更新线索
  async update(id: number, updateLeadDto: any): Promise<Lead> {
    const lead = await this.findOneById(id);
    if (!lead) {
      throw new NotFoundException('线索不存在');
    }

    // 如果更新负责人，需要查找用户
    if (updateLeadDto.owner_id) {
      const owner = await this.userService.findOneById(updateLeadDto.owner_id);
      if (!owner) {
        throw new NotFoundException('用户不存在');
      }
      lead.owner = owner;
      delete updateLeadDto.owner_id;
    }

    // 更新线索信息
    Object.assign(lead, updateLeadDto);

    return this.leadRepository.save(lead);
  }

  // 删除线索
  async delete(id: number): Promise<void> {
    const result = await this.leadRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('线索不存在');
    }
  }

  // 更新线索状态
  async updateStatus(id: number, status: string): Promise<Lead> {
    const lead = await this.findOneById(id);
    if (!lead) {
      throw new NotFoundException('线索不存在');
    }

    lead.status = status;
    return this.leadRepository.save(lead);
  }

  // 导出线索
  async export(query: any): Promise<Lead[]> {
    const qb = this.buildQueryBuilder(query);
    return qb.getMany();
  }
}
