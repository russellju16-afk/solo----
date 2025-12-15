import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductBrand } from './entities/product-brand.entity';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

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

  // 前台推荐：同类目产品（默认返回上架的前 N 条）
  async findRecommendations(
    productId: number,
    options: { limit?: number; categoryId?: number } = {},
  ): Promise<any[]> {
    const requestedLimit = Number(options.limit);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 12) : 4;

    let categoryId = options.categoryId;
    if (!Number.isFinite(categoryId)) {
      const current = await this.productRepository
        .createQueryBuilder('p')
        .leftJoin('p.category', 'c')
        .select(['p.id', 'c.id'])
        .where('p.id = :id', { id: productId })
        .getOne();
      categoryId = current?.category?.id;
    }

    if (!Number.isFinite(categoryId)) {
      return [];
    }

    const qb = this.buildQueryBuilder({ categoryId, status: 1 });
    qb.andWhere('product.id != :id', { id: productId });

    const { raw, entities } = await qb.take(limit).getRawAndEntities();
    return entities.map((entity, index) => {
      const coverImage = raw[index]?.cover_image;
      return coverImage ? { ...entity, cover_image: coverImage } : entity;
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
    await this.imageRepository
      .createQueryBuilder()
      .delete()
      .where('productId = :productId', { productId: id })
      .execute();
    await this.productRepository.delete(id);
  }

  // 产品上下架
  async updateStatus(id: number, status: number): Promise<Product> {
    await this.productRepository.update(id, { status });
    return this.findOneById(id);
  }

  // 生成批量导入模板
  async generateImportTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Admin System';
    workbook.lastModifiedBy = 'Admin System';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // 创建产品数据工作表
    const productSheet = workbook.addWorksheet('products');

    // 设置表头
    const headers = [
      '产品名称', '品类ID', '品类名称', '品牌ID', '品牌名称', '规格重量',
      '包装类型', '适用场景', '最低起订量', '供应区域', '产品描述',
      '状态', '价格趋势', '最近价格更新时间', '最近价格备注',
    ];

    // 添加表头行
    const headerRow = productSheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'CCCCCC' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.font = {
        bold: true,
      };
    });

    // 设置列宽
    const columnWidths = [
      20, 10, 20, 10, 20, 15,
      15, 20, 15, 20, 30,
      10, 10, 20, 30,
    ];
    productSheet.columns.forEach((column, index) => {
      if (columnWidths[index]) {
        column.width = columnWidths[index];
      }
    });

    // 添加示例数据
    const sampleData = [
      '示例产品', '', '大米', '', '示例品牌', '5kg',
      '袋装', '高校,团餐', '100箱', '全国', '这是一个示例产品',
      '上架', '上涨', '2024-01-01', '参考价格',
    ];
    const sampleRow = productSheet.addRow(sampleData);
    sampleRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // 创建说明工作表
    const instructionSheet = workbook.addWorksheet('说明');

    // 字段说明
    instructionSheet.addRow(['字段说明']);
    instructionSheet.addRow(['']);
    instructionSheet.addRow(['字段名', '必填', '说明', '示例']);
    
    const fieldInstructions = [
      ['产品名称', '是', '产品的名称', '东北大米'],
      ['品类ID', '否', '品类ID，与品类名称二选一', '1'],
      ['品类名称', '否', '品类名称，与品类ID二选一', '大米'],
      ['品牌ID', '否', '品牌ID，与品牌名称二选一', '1'],
      ['品牌名称', '否', '品牌名称，与品牌ID二选一', '五常大米'],
      ['规格重量', '是', '产品的规格重量', '5kg'],
      ['包装类型', '是', '产品的包装类型', '袋装'],
      ['适用场景', '否', '适用场景，多选用英文逗号分隔', '高校,团餐'],
      ['最低起订量', '否', '产品的最低起订量', '100箱'],
      ['供应区域', '否', '产品的供应区域', '全国'],
      ['产品描述', '否', '产品的详细描述', '优质东北大米'],
      ['状态', '否', '产品状态：1/上架=上架，0/下架=下架，默认上架', '上架'],
      ['价格趋势', '否', '价格趋势：up/上涨, down/下降, flat/持平', '上涨'],
      ['最近价格更新时间', '否', '最近价格更新时间，格式：YYYY-MM-DD', '2024-01-01'],
      ['最近价格备注', '否', '内部参考备注', '参考价格'],
    ];

    fieldInstructions.forEach((instruction) => {
      instructionSheet.addRow(instruction);
    });

    // 设置说明工作表样式
    instructionSheet.getRow(1).font = { bold: true, size: 14 };
    instructionSheet.getRow(3).font = { bold: true };
    instructionSheet.getRow(3).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'CCCCCC' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // 设置说明工作表列宽
    instructionSheet.columns = [
      { width: 15 },
      { width: 10 },
      { width: 40 },
      { width: 20 },
    ];

    // 导出为Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  // 批量导入产品
  async importProductsFromExcel(
    fileBuffer: Buffer,
    options: { commit?: boolean; originalFilename?: string } = {},
  ): Promise<any> {
    try {
      // 解析Excel文件
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);
      const worksheet = workbook.getWorksheet('products');
      if (!worksheet) {
        throw new BadRequestException('Excel文件中缺少products工作表');
      }

      // 读取数据（跳过表头行）
      const rows = worksheet.getRows(2, worksheet.rowCount - 1) || [];
      const total = rows.length;
      let success = 0;
      let failed = 0;
      const errors: { row: number; field: string; message: string }[] = [];
      const processedProducts: any[] = [];
      const duplicateKeys = new Set<string>();

      // 准备品牌和品类数据，用于快速查找
      const categories = await this.categoryRepository.find();
      const brands = await this.brandRepository.find();
      const categoryMap = new Map<string, ProductCategory>();
      const categoryNameMap = new Map<string, ProductCategory>();
      const brandMap = new Map<string, ProductBrand>();
      const brandNameMap = new Map<string, ProductBrand>();

      categories.forEach((category) => {
        categoryMap.set(category.id.toString(), category);
        categoryNameMap.set(category.name, category);
      });

      brands.forEach((brand) => {
        brandMap.set(brand.id.toString(), brand);
        brandNameMap.set(brand.name, brand);
      });

      // 读取现有产品，用于去重检查
      const existingProducts = await this.productRepository.find({
        relations: ['category', 'brand'],
      });
      const existingProductKeys = new Set<string>();

      existingProducts.forEach((product) => {
        const key = `${product.name}-${product.spec_weight}-${product.category.id}-${product.brand ? product.brand.id : 'null'}`;
        existingProductKeys.add(key);
      });

      // 处理每一行数据
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // 实际行号（从2开始）

        try {
          // 读取字段值
          const rowData: any = {};
          rowData.name = (row.getCell(1).value as string || '').trim();
          rowData.category_id = (row.getCell(2).value as number || '').toString().trim();
          rowData.category_name = (row.getCell(3).value as string || '').trim();
          rowData.brand_id = (row.getCell(4).value as number || '').toString().trim();
          rowData.brand_name = (row.getCell(5).value as string || '').trim();
          rowData.spec_weight = (row.getCell(6).value as string || '').trim();
          rowData.package_type = (row.getCell(7).value as string || '').trim();
          rowData.applicable_scenes = (row.getCell(8).value as string || '').trim();
          rowData.moq = (row.getCell(9).value as string || '').trim();
          rowData.supply_area = (row.getCell(10).value as string || '').trim();
          rowData.description = (row.getCell(11).value as string || '').trim();
          rowData.status = (row.getCell(12).value as any || '').toString().trim();
          rowData.price_trend = (row.getCell(13).value as string || '').trim();
          rowData.latest_price_updated_at = (row.getCell(14).value as Date || '').toString().trim();
          rowData.latest_price_note = (row.getCell(15).value as string || '').trim();

          // 数据清洗
          Object.keys(rowData).forEach((key) => {
            if (rowData[key] === '') {
              rowData[key] = null;
            }
          });

          // 必填字段校验
          if (!rowData.name) {
            throw new Error('产品名称不能为空');
          }
          if (!rowData.spec_weight) {
            throw new Error('规格重量不能为空');
          }
          if (!rowData.package_type) {
            throw new Error('包装类型不能为空');
          }
          if (!rowData.category_id && !rowData.category_name) {
            throw new Error('品类ID和品类名称不能同时为空');
          }

          // 处理品类
          let category: ProductCategory | undefined;
          if (rowData.category_id) {
            category = categoryMap.get(rowData.category_id);
            if (!category) {
              throw new Error(`品类ID ${rowData.category_id} 不存在`);
            }
          } else if (rowData.category_name) {
            category = categoryNameMap.get(rowData.category_name);
            if (!category) {
              throw new Error(`品类名称 ${rowData.category_name} 不存在`);
            }
          }

          // 处理品牌
          let brand: ProductBrand | undefined;
          if (rowData.brand_id) {
            brand = brandMap.get(rowData.brand_id);
            if (!brand) {
              throw new Error(`品牌ID ${rowData.brand_id} 不存在`);
            }
          } else if (rowData.brand_name) {
            brand = brandNameMap.get(rowData.brand_name);
            if (!brand) {
              throw new Error(`品牌名称 ${rowData.brand_name} 不存在`);
            }
          }

          // 处理状态
          if (rowData.status) {
            if (['上架', '1', 'true'].includes(rowData.status)) {
              rowData.status = 1;
            } else if (['下架', '0', 'false'].includes(rowData.status)) {
              rowData.status = 0;
            } else {
              throw new Error(`状态值 ${rowData.status} 无效，只能是上架/下架/1/0/true/false`);
            }
          } else {
            rowData.status = 1; // 默认上架
          }

          // 处理价格趋势
          if (rowData.price_trend) {
            const validPriceTrends = ['up', 'down', 'flat', '上涨', '下降', '持平'];
            if (!validPriceTrends.includes(rowData.price_trend)) {
              throw new Error(`价格趋势 ${rowData.price_trend} 无效，只能是up/上涨, down/下降, flat/持平`);
            }
            // 统一转换为英文
            const priceTrendMap: any = {
              '上涨': 'up',
              '下降': 'down',
              '持平': 'flat',
            };
            rowData.price_trend = priceTrendMap[rowData.price_trend] || rowData.price_trend;
          }

          // 处理适用场景
          if (rowData.applicable_scenes) {
            rowData.applicable_scenes = rowData.applicable_scenes.split(',').map((scene: string) => scene.trim());
          }

          // 处理最近价格更新时间
          if (rowData.latest_price_updated_at) {
            const date = new Date(rowData.latest_price_updated_at);
            if (isNaN(date.getTime())) {
              throw new Error(`最近价格更新时间 ${rowData.latest_price_updated_at} 格式无效，应为YYYY-MM-DD`);
            }
            rowData.latest_price_updated_at = date;
          }

          // 生成唯一键，用于去重
          const uniqueKey = `${rowData.name}-${rowData.spec_weight}-${category?.id}-${brand?.id || 'null'}`;

          // 文件内去重检查
          if (duplicateKeys.has(uniqueKey)) {
            throw new Error('文件内重复产品');
          }
          duplicateKeys.add(uniqueKey);

          // 数据库去重检查
          if (existingProductKeys.has(uniqueKey)) {
            throw new Error('数据库中已存在相同产品');
          }

          // 构建产品数据
          const productData: any = {
            name: rowData.name,
            spec_weight: rowData.spec_weight,
            package_type: rowData.package_type,
            applicable_scenes: rowData.applicable_scenes,
            moq: rowData.moq,
            supply_area: rowData.supply_area,
            description: rowData.description,
            status: rowData.status,
            price_trend: rowData.price_trend,
            latest_price_updated_at: rowData.latest_price_updated_at,
            latest_price_note: rowData.latest_price_note,
            category: category,
            brand: brand,
          };

          processedProducts.push(productData);
          success++;
        } catch (error: any) {
          failed++;
          errors.push({
            row: rowNum,
            field: error.field || '其他',
            message: error.message,
          });
        }
      }

      // 如果需要提交数据，则执行插入操作
      if (options.commit && processedProducts.length > 0) {
        // 分批插入，每批100条
        const batchSize = 100;
        for (let i = 0; i < processedProducts.length; i += batchSize) {
          const batch = processedProducts.slice(i, i + batchSize);
          await this.productRepository.save(batch);
        }
      }

      // 生成错误明细文件（如果有错误）
      let errorFileUrl: string | undefined;
      if (failed > 0) {
        // 创建错误明细文件
        const errorWorkbook = new ExcelJS.Workbook();
        const errorWorksheet = errorWorkbook.addWorksheet('错误明细');

        // 设置表头
        const errorHeaders = [
          '行号', '产品名称', '品类ID', '品类名称', '品牌ID', '品牌名称', '规格重量',
          '包装类型', '适用场景', '最低起订量', '供应区域', '产品描述',
          '状态', '价格趋势', '最近价格更新时间', '最近价格备注', '错误信息',
        ];
        errorWorksheet.addRow(errorHeaders);

        // 添加错误数据
        errors.forEach((error) => {
          const originalRow = rows[error.row - 2];
          if (originalRow) {
            const rowData = originalRow.values.slice(1);
            rowData.push(error.message);
            errorWorksheet.addRow(rowData);
          }
        });

        // 这里可以将错误文件保存到服务器，并返回下载URL
        // 由于当前项目没有文件存储配置，暂时不生成文件URL
        // errorFileUrl = `/uploads/import-errors/${Date.now()}-error.xlsx`;
      }

      return {
        total,
        success,
        failed,
        errors,
        errorFileUrl,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
