import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_brands')
export class ProductBrand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  description: string;

  @Column({
    type: 'int',
    default: 0,
  })
  sort_order: number;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}
