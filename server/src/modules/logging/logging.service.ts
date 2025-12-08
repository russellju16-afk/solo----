import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog } from './entities/operation-log.entity';

interface OperationLogQuery {
  page?: number | string;
  pageSize?: number | string;
  keyword?: string;
  username?: string;
  action?: string;
  start_time?: string;
  end_time?: string;
  startTime?: string;
  endTime?: string;
}

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(OperationLog)
    private readonly logRepository: Repository<OperationLog>,
  ) {}

  // 获取操作日志列表（分页 + 筛选）
  async findAll(query: OperationLogQuery) {
    const page = parseInt(String(query.page || 1), 10);
    const pageSize = parseInt(String(query.pageSize || 10), 10);
    const keyword = query.keyword?.trim();
    const username = query.username?.trim();
    const action = query.action?.trim();
    const startTime = query.start_time || query.startTime;
    const endTime = query.end_time || query.endTime;

    const qb = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.created_at', 'DESC');

    if (keyword) {
      qb.andWhere('(log.detail LIKE :keyword OR log.module LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    if (username) {
      qb.andWhere('(user.username LIKE :username OR user.name LIKE :username)', {
        username: `%${username}%`,
      });
    }

    if (action) {
      qb.andWhere('log.action = :action', { action });
    }

    if (startTime) {
      qb.andWhere('log.created_at >= :startTime', { startTime: new Date(startTime) });
    }

    if (endTime) {
      qb.andWhere('log.created_at <= :endTime', { endTime: new Date(endTime) });
    }

    const [rows, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();

    const data = rows.map((log) => ({
      id: log.id,
      username: log.user?.username || log.user?.name || '未知用户',
      action: log.action,
      module: log.module,
      description: log.detail,
      ip_address: '',
      created_at: log.created_at,
    }));

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  // 清空操作日志
  async clearAll() {
    await this.logRepository.clear();
    return { success: true };
  }
}
