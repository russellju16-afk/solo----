import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('feishu_config')
export class FeishuConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false, comment: '是否启用飞书集成' })
  enabled: boolean;

  @Column({ length: 255, nullable: true, comment: '飞书App ID' })
  app_id: string;

  @Column({ length: 255, nullable: true, comment: '飞书App Secret' })
  app_secret: string;

  @Column({ length: 500, nullable: true, comment: '飞书Webhook URL' })
  webhook_url: string;

  @Column({ length: 100, nullable: true, comment: '飞书机器人名称' })
  bot_name: string;

  @Column({ length: 100, nullable: true, comment: '飞书部门ID' })
  department_id: string;

  @Column({ length: 500, nullable: true, comment: '飞书用户ID列表，多个用逗号分隔' })
  user_ids: string;

  @Column({ type: 'text', nullable: true, comment: '消息模板' })
  message_template: string;

  @Column({ default: true, comment: '是否启用线索通知' })
  lead_notification_enabled: boolean;

  @Column({ default: false, comment: '是否启用操作通知' })
  operation_notification_enabled: boolean;

  @CreateDateColumn({
    name: 'created_at',
    comment: '创建时间',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    comment: '更新时间',
  })
  updated_at: Date;
}