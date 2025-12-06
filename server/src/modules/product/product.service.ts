import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  // 构建查询条件
  private buildQueryBuilder(query: any) {
    const qb = this.productRepository.createQueryBuilder('product')
      .orderBy('product.id', 'DESC');

    // 按名称搜索
    if (query.keyword) {
      qb.where('product.name LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    return qb;
  }

  // 获取产品列表（支持分页和筛选）
  async findAll(query: any): Promise<any> {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    const qb = this.buildQueryBuilder(query);

    const [products, total] = await qb
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getManyAndCount();

    return {
      data: products,
      total,
      page,
      pageSize,
    };
  }

  // 根据ID查找产品
  async findOneById(id: number): Promise<Product | undefined> {
    return this.productRepository.findOne({
      where: { id },
    });
  }

  // 创建产品
  async create(createProductDto: any): Promise<any> {
    return this.productRepository.save(createProductDto);
  }

  // 更新产品
  async update(id: number, updateProductDto: any): Promise<Product> {
    await this.productRepository.update(id, updateProductDto);
    return this.findOneById(id);
  }

  // 删除产品
  async delete(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }

  // 产品上下架
  async updateStatus(id: number, status: number): Promise<Product> {
    await this.productRepository.update(id, { status });
    return this.findOneById(id);
  }
}