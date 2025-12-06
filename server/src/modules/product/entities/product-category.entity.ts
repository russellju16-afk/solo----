import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_categories')
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  name: string; // 大米/面粉/食用油/其他

  @Column({
    type: 'int',
    default: 0,
  })
  sort_order: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
