import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { LeadFollowup } from './lead-followup.entity';
import { User } from '../../user/entities/user.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'lead_type',
    type: 'varchar',
    length: 20,
    default: 'form',
  })
  leadType: 'form' | 'signal';

  @Column({
    name: 'channel',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  channel: 'phone' | 'wechat' | 'email' | 'unknown' | null;

  @Column({
    name: 'session_id',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  sessionId: string | null;

  @Column({
    name: 'page_path',
    type: 'text',
    nullable: true,
  })
  pagePath: string | null;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  meta: any | null;

  @Column({
    name: 'is_contactable',
    type: 'boolean',
    default: true,
  })
  isContactable: boolean;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  ip: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  ua: string | null;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    name: 'company_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  companyName: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  city: string;

  @Column({
    name: 'channel_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  channelType: string; // 高校/团餐/...

  @Column({
    name: 'interested_categories',
    type: 'simple-array',
    nullable: true,
  })
  interestedCategories: string[]; // 意向品类，如：大米/面粉/...

  @Column({
    name: 'monthly_volume_segment',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  monthlyVolumeSegment: string; // 月度用量区间枚举

  @Column({
    name: 'brand_requirement',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  brandRequirement: string; // 品牌要求

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string; // 需求描述

  @Column({
    name: 'product_id',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  productId: string; // 如果从某个产品详情提交

  @Column({
    name: 'source',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  source: string; // home_short_form/contact_page/...

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'new',
  })
  status: string; // new / processing / won / lost

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'owner_id' })
  owner: User; // 负责销售

  @OneToMany(() => LeadFollowup, (followup) => followup.lead)
  followups: LeadFollowup[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
