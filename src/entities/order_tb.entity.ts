import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Staff } from './staff.entity';
import { Table } from './tables.entity';
import { OrderDetails } from './order-details.entity';
import { Customer } from './customer.entity';
import { Invoice } from './invoice.entity';
import { Branch } from './branches.entity';

@Entity({ name: 'order_tb' })
export class Order {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'phonecustomer', length: 15 })
  phoneCustomer: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
  @JoinColumn({ name: 'phonecustomer', referencedColumnName: 'phone' })
  customer: Customer;

  @Column({ name: 'servicetype', length: 10 })
  serviceType: string;

  @Column({ name: 'totalprice', type: 'int' })
  totalPrice: number;

  @Column({ name: 'staffid', type: 'int', nullable: true })
  staffID: number;

  @ManyToOne(() => Staff, (staff) => staff.orders)
  @JoinColumn({ name: 'staffid' })
  staff: Staff;

  @Column({ name: 'tableid', type: 'int', nullable: true })
  tableID: number;

  @ManyToOne(() => Table, (table) => table.orders)
  @JoinColumn({ name: 'tableid' })
  table: Table;

  @Column({ name: 'orderdate', type: 'timestamp' })
  orderDate: Date;

  @Column({ name: 'status', length: 20 })
  status: string;

  @OneToMany(() => OrderDetails, (detail) => detail.order)
  details: OrderDetails[];

  @OneToMany(() => Invoice, (invoice) => invoice.order)
  invoices: Invoice[];

  @ManyToOne(() => Branch, (branch) => branch.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchid' })
  branch: Branch;

  @Column({ name: 'branchid', type: 'int' })
  branchId: number;
}
