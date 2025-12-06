import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner) private bannerRepository: Repository<Banner>,
  ) {}

  // 获取所有轮播图（按位置和排序）
  async findAll(query: any = {}): Promise<Banner[]> {
    const qb = this.bannerRepository.createQueryBuilder('banner')
      .orderBy('banner.sort_order', 'ASC');

    // 按位置筛选
    if (query.position) {
      qb.where('banner.position = :position', { position: query.position });
    }

    // 只返回启用的轮播图（前台用）
    if (query.enabled !== undefined) {
      qb.andWhere('banner.enabled = :enabled', { enabled: query.enabled });
    }

    return qb.getMany();
  }

  // 根据ID获取轮播图
  async findOneById(id: number): Promise<Banner | undefined> {
    return this.bannerRepository.findOne({ where: { id } });
  }

  // 创建轮播图
  async create(createBannerDto: any): Promise<any> {
    return this.bannerRepository.save(createBannerDto);
  }

  // 更新轮播图
  async update(id: number, updateBannerDto: any): Promise<Banner> {
    const banner = await this.findOneById(id);
    if (!banner) {
      throw new NotFoundException('轮播图不存在');
    }

    Object.assign(banner, updateBannerDto);
    return this.bannerRepository.save(banner);
  }

  // 删除轮播图
  async delete(id: number): Promise<void> {
    const result = await this.bannerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('轮播图不存在');
    }
  }

  // 更新轮播图状态（启用/禁用）
  async updateEnabled(id: number, enabled: number): Promise<Banner> {
    const banner = await this.findOneById(id);
    if (!banner) {
      throw new NotFoundException('轮播图不存在');
    }

    banner.enabled = enabled;
    return this.bannerRepository.save(banner);
  }
}
