import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { Table } from './tables.entity';
import { Order } from './order_tb.entity';
import { BranchMaterial } from './branch_material.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'createdat' })
  createdAt: Date;

  @OneToMany(() => Staff, staff => staff.branch)
  staff: Staff[];

  @OneToMany(() => Table, table => table.branch)
  tables: Table[];

  @OneToMany(() => Order, order => order.branch)
  orders: Order[];

  @Column({ name: 'managerid', nullable: true })
  managerId: number;

  @ManyToOne(() => Staff, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'managerid' })
  manager: Staff;

  @OneToMany(() => BranchMaterial, (branchMaterial) => branchMaterial.branch)
  branchMaterials: BranchMaterial[];
}
