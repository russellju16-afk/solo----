import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductBrand } from './entities/product-brand.entity';

@Injectable()
export class ProductBrandService {
  constructor(
    @InjectRepository(ProductBrand) private brandRepository: Repository<ProductBrand>,
  ) {}

  // 获取所有品牌
  async findAll(): Promise<ProductBrand[]> {
    return this.brandRepository.find({
      order: { sort_order: 'ASC' },
    });
  }

  // 根据ID查找品牌
  async findOneById(id: number): Promise<ProductBrand | undefined> {
    return this.brandRepository.findOne({ where: { id } });
  }

  // 创建品牌
  async create(createBrandDto: any): Promise<any> {
    return this.brandRepository.save(createBrandDto);
  }

  // 更新品牌
  async update(id: number, updateBrandDto: any): Promise<ProductBrand> {
    const brand = await this.findOneById(id);
    if (!brand) {
      throw new NotFoundException('品牌不存在');
    }

    Object.assign(brand, updateBrandDto);
    return this.brandRepository.save(brand);
  }

  // 删除品牌
  async delete(id: number): Promise<void> {
    const result = await this.brandRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('品牌不存在');
    }
  }
}
