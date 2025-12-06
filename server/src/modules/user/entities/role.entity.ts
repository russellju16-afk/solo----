import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  name: string; // admin/operator/sales

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
