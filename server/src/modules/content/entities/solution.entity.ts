import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('solutions')
export class Solution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  channel_type: string; // 高校/团餐/...

  @Column({
    type: 'varchar',
    length: 100,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  intro: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  pain_points: string[]; // 痛点，JSON数组

  @Column({
    type: 'json',
    nullable: true,
  })
  solutions: string[]; // 解决方案，JSON数组

  @Column({
    type: 'json',
    nullable: true,
  })
  product_ids: number[]; // 关联产品ID，JSON数组

  @Column({
    type: 'int',
    default: 0,
  })
  sort_order: number;

  @Column({
    type: 'tinyint',
    default: 1,
  })
  enabled: number; // 1: 启用, 0: 禁用

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
