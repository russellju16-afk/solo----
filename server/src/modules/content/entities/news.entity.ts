import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  category: string; // 公司新闻/行业资讯/行情分析

  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  cover_image: string;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  published_at: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status: string; // draft/published

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
