import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Customer } from './customer.entity';
import { Order } from './order_tb.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  star: number;

  @Column({ name: 'phonecustomer'})
  phoneCustomer: string;

  @Column({ name: 'productid'})
  productId: number;

  @Column({ name: 'orderid', nullable: true })
  orderId: number;

  @ManyToOne(() => Customer, (customer) => customer.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'phonecustomer', referencedColumnName: 'phone' })
  customer: Customer;

  @ManyToOne(() => Product, (product) => product.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productid' })
  product: Product;

  @ManyToOne(() => Order, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'orderid' })
  order: Order;

  @CreateDateColumn({ name: 'createdat'})
  createdAt: Date;
}
