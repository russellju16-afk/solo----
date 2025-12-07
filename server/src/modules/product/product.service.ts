import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  // 构建查询条件
  private buildQueryBuilder(query: any) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .leftJoin('product.brand', 'brand')
      .select([
        'product.id',
        'product.name',
        'product.spec_weight',
        'product.package_type',
        'product.status',
        'product.description',
        'category.id',
        'category.name',
        'brand.id',
        'brand.name',
      ])
      .orderBy('product.id', 'DESC');

    // 按名称搜索
    if (query.keyword) {
      qb.andWhere('product.name LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    // 按分类筛选（兼容 categoryId / category_id）
    const categoryId = query.categoryId || query.category_id;
    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: Number(categoryId) });
    }

    // 按品牌筛选（兼容 brandId / brand_id）
    const brandId = query.brandId || query.brand_id;
    if (brandId) {
      qb.andWhere('product.brandId = :brandId', { brandId: Number(brandId) });
    }

    // 按状态筛选
    if (query.status !== undefined && query.status !== null && query.status !== '') {
      qb.andWhere('product.status = :status', { status: Number(query.status) });
    }

    // 选择首图作为封面，避免加载所有图片
    qb.addSelect((subQuery) => {
      return subQuery
        .select('pi.url')
        .from(ProductImage, 'pi')
        .where('pi.productId = product.id')
        .orderBy('pi.sort_order', 'ASC')
        .addOrderBy('pi.id', 'ASC')
        .limit(1);
    }, 'cover_image');

    return qb;
  }

  // 获取产品列表（支持分页和筛选）
  async findAll(query: any): Promise<any> {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    const qb = this.buildQueryBuilder(query);

    const total = await qb.getCount();

    const pagedQb = qb.clone().take(pageSize).skip((page - 1) * pageSize);

    const { raw, entities } = await pagedQb.getRawAndEntities();
    const products = entities.map((entity, index) => {
      const coverImage = raw[index]?.cover_image;
      return coverImage ? { ...entity, cover_image: coverImage } : entity;
    });

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
      relations: ['category', 'brand', 'images'],
      order: {
        images: {
          sort_order: 'ASC',
        },
      },
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
