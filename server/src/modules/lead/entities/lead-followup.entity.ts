import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Lead } from './lead.entity';
import { User } from '../../user/entities/user.entity';

@Entity('lead_followups')
export class LeadFollowup {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lead, (lead) => lead.followups)
  lead: Lead;

  @ManyToOne(() => User, (user) => user.id)
  operator: User; // 跟进人

  @Column({
    type: 'text',
  })
  note: string; // 跟进备注

  @Column({
    type: 'varchar',
    length: 20,
  })
  status_after: string; // 跟进后的状态

  @CreateDateColumn()
  created_at: Date;
}
