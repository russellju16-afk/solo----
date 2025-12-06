import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('operation_logs')
export class OperationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({
    type: 'varchar',
    length: 50,
  })
  action: string; // 操作类型：create/update/delete

  @Column({
    type: 'varchar',
    length: 50,
  })
  module: string; // 操作模块：product/user/lead

  @Column({
    type: 'text',
    nullable: true,
  })
  detail: string; // 操作详情

  @CreateDateColumn()
  created_at: Date;
}
