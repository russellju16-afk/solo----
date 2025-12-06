import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory) private categoryRepository: Repository<ProductCategory>,
  ) {}

  // 获取所有分类
  async findAll(): Promise<ProductCategory[]> {
    return this.categoryRepository.find({
      order: { sort_order: 'ASC' },
    });
  }

  // 根据ID查找分类
  async findOneById(id: number): Promise<ProductCategory | undefined> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  // 创建分类
  async create(createCategoryDto: any): Promise<any> {
    return this.categoryRepository.save(createCategoryDto);
  }

  // 更新分类
  async update(id: number, updateCategoryDto: any): Promise<ProductCategory> {
    const category = await this.findOneById(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  // 删除分类
  async delete(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('分类不存在');
    }
  }
}
