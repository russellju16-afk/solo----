import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { ProductBrand } from './product-brand.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Index()
  @ManyToOne(() => ProductCategory, (category) => category.products)
  category: ProductCategory;

  @Index()
  @ManyToOne(() => ProductBrand, (brand) => brand.products)
  brand: ProductBrand;

  @Column({
    type: 'varchar',
    length: 20,
  })
  spec_weight: string; // 规格重量，如：5kg/10kg/25kg

  @Column({
    type: 'varchar',
    length: 50,
  })
  package_type: string; // 包装类型，如：袋装/箱装

  @Column({
    type: 'json',
    nullable: true,
  })
  applicable_scenes: string[]; // 适用场景，如：高校/团餐/... 多选，存JSON

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  moq: string; // 最低起订量

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  supply_area: string; // 供应区域

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'tinyint',
    default: 1,
  })
  @Index()
  status: number; // 1: 上架, 0: 下架

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  latest_price_note: string; // 最近价格备注

  @Column({
    type: 'datetime',
    nullable: true,
  })
  latest_price_updated_at: Date; // 最近价格更新时间

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  price_trend: string; // 价格趋势：up/down/flat

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
