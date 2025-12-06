import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  position: string; // home_top 等

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  sub_title: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  image_url: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  link_url: string;

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
