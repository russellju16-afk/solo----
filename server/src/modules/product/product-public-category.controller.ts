import { Controller, Get } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';

// Public 分类查询路由：/api/categories（无需认证）
@Controller('categories')
export class ProductPublicCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }
}

