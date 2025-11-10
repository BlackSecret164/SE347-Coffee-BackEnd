import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Order } from './order_tb.entity';
import { Branch } from './branches.entity';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  status: string;

  @Column({ length: 15, nullable: true, name: 'phoneorder' })
  phoneOrder?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'bookingtime' })
  bookingTime?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'seatingtime' })
  seatingTime?: Date;

  @Column({ type: 'int' })
  seat: number;

  @Column({ length: 50, nullable: true })
  name: string;

  @Column({ type: 'int', name: 'branchid', nullable: true })
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.tables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchid' })
  branch: Branch;

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];
}
