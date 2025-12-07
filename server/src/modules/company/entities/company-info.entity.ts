import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('company_info')
export class CompanyInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  company_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  logo: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  banner_image: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  short_description: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  introduction: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  service_areas: string; // 服务区域

  @Column({
    type: 'text',
    nullable: true,
  })
  service_channels: string; // 服务渠道

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  address: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  website: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  contact_person: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  business_hours: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  wechat_qr_code: string; // 微信二维码链接

  @Column({
    type: 'text',
    nullable: true,
  })
  social_media: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  seo_title: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  seo_keywords: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  seo_description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
