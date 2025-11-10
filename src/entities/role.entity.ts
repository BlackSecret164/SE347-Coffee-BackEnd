import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Staff } from './staff.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  roleId: number;

  @Column({ length: 20 })
  roleName: string;

  @OneToMany(() => Staff, staff => staff.role)
  staff: Staff[];
}