import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from './order_tb.entity';

@Entity({ name: 'invoice' })
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.invoices, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ length: 20, nullable: true })
  paymentMethod: string;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  discount: number;

  @Column('numeric', { precision: 10, scale: 2 })
  finalAmount: number;
}
