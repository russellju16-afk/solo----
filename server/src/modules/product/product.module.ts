import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductBrand } from './entities/product-brand.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductCategoryService } from './product-category.service';
import { ProductCategoryController } from './product-category.controller';
import { ProductBrandService } from './product-brand.service';
import { ProductBrandController } from './product-brand.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      ProductBrand,
      ProductImage,
    ]),
  ],
  controllers: [
    ProductController,
    ProductCategoryController,
    ProductBrandController,
  ],
  providers: [
    ProductService,
    ProductCategoryService,
    ProductBrandService,
  ],
  exports: [ProductService],
})
export class ProductModule {}
