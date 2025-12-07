import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadFollowup } from './entities/lead-followup.entity';
import { Lead } from './entities/lead.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class LeadFollowupService {
  constructor(
    @InjectRepository(LeadFollowup) private followupRepository: Repository<LeadFollowup>,
    @InjectRepository(Lead) private leadRepository: Repository<Lead>,
    private userService: UserService,
  ) {}

  // 获取线索的所有跟进记录
  async findByLeadId(leadId: number): Promise<any[]> {
    const records = await this.followupRepository.find({
      where: { lead: { id: leadId } },
      relations: ['operator'],
      order: { created_at: 'DESC' },
    });

    return records.map((record) => ({
      id: record.id,
      operatorId: record.operator?.id,
      operatorName: record.operator?.name,
      note: record.note,
      statusAfter: record.status_after,
      createdAt: record.created_at,
    }));
  }

  // 创建跟进记录
  async create(leadId: number, operatorId: number, createFollowupDto: any): Promise<LeadFollowup> {
    // 检查线索是否存在
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException('线索不存在');
    }

    // 检查用户是否存在
    const operator = await this.userService.findOneById(operatorId);
    if (!operator) {
      throw new NotFoundException('用户不存在');
    }

    // 创建跟进记录
    const followup = this.followupRepository.create({
      lead,
      operator,
      note: createFollowupDto.note,
      status_after: createFollowupDto.statusAfter || createFollowupDto.status_after,
    });

    return this.followupRepository.save(followup);
  }

  // 根据ID获取跟进记录
  async findOneById(id: number): Promise<LeadFollowup | undefined> {
    return this.followupRepository.findOne({
      where: { id },
      relations: ['operator'],
    });
  }

  // 更新跟进记录
  async update(id: number, updateFollowupDto: any): Promise<LeadFollowup> {
    const followup = await this.findOneById(id);
    if (!followup) {
      throw new NotFoundException('跟进记录不存在');
    }

    // 如果更新操作人，需要检查用户是否存在
    if (updateFollowupDto.operator_id) {
      const operator = await this.userService.findOneById(updateFollowupDto.operator_id);
      if (!operator) {
        throw new NotFoundException('用户不存在');
      }
      followup.operator = operator;
    }

    // 更新跟进记录信息
    Object.assign(followup, updateFollowupDto);

    return this.followupRepository.save(followup);
  }

  // 删除跟进记录
  async delete(id: number): Promise<void> {
    const result = await this.followupRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('跟进记录不存在');
    }
  }
}
