import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  customer_name: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  industry_type: string; // 高校/团餐/商超/...

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  summary: string;

  @Column({
    type: 'text',
  })
  detail: string;

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
