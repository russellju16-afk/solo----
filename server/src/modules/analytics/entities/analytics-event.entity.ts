import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  event: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  path: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  referrer: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  session_id: string | null;

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
    type: 'simple-json',
    nullable: true,
  })
  meta: any | null;

  @CreateDateColumn()
  created_at: Date;
}

