import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductBrand } from './entities/product-brand.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory) private categoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductBrand) private brandRepository: Repository<ProductBrand>,
    @InjectRepository(ProductImage) private imageRepository: Repository<ProductImage>,
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

  // 将前端传入的 id 映射为实体关系，确保外键存在
  private async buildRelations(categoryId?: number, brandId?: number) {
    const relations: Partial<Product> = {};

    if (categoryId !== undefined) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new BadRequestException('分类不存在');
      }
      relations.category = category;
    }

    if (brandId !== undefined) {
      const brand = await this.brandRepository.findOne({ where: { id: brandId } });
      if (!brand) {
        throw new BadRequestException('品牌不存在');
      }
      relations.brand = brand;
    }

    return relations;
  }

  // 保存/替换产品图片，保持排序
  private async replaceImages(productId: number, imageUrls?: string[]) {
    if (imageUrls === undefined) return;

    await this.imageRepository
      .createQueryBuilder()
      .delete()
      .where('productId = :productId', { productId })
      .execute();

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return;
    }

    const records = imageUrls.map((url, index) =>
      this.imageRepository.create({
        url,
        sort_order: index,
        product: { id: productId } as Product,
      }),
    );
    await this.imageRepository.save(records);
  }

  private splitPayload(dto: any) {
    const { category_id, brand_id, images, ...rest } = dto;
    return {
      rest,
      categoryId: category_id !== undefined ? Number(category_id) : undefined,
      brandId: brand_id !== undefined ? Number(brand_id) : undefined,
      imageUrls: Array.isArray(images) ? images : undefined,
    };
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
    const { rest, categoryId, brandId, imageUrls } = this.splitPayload(createProductDto);
    const relations = await this.buildRelations(categoryId, brandId);

    const product = await this.productRepository.save({
      ...rest,
      ...relations,
    });

    await this.replaceImages(product.id, imageUrls);
    return this.findOneById(product.id);
  }

  // 更新产品
  async update(id: number, updateProductDto: any): Promise<Product> {
    const existing = await this.productRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('产品不存在');
    }

    const { rest, categoryId, brandId, imageUrls } = this.splitPayload(updateProductDto);
    const relations = await this.buildRelations(categoryId, brandId);

    await this.productRepository.save({
      ...existing,
      ...rest,
      ...relations,
      id,
    });

    await this.replaceImages(id, imageUrls);
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
