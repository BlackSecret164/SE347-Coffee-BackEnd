import { Entity, ManyToOne, Column, JoinColumn, PrimaryColumn } from 'typeorm';
import { Product } from './product.entity';
import { Order } from './order_tb.entity';

@Entity({ name: 'order_details' })
export class OrderDetails {
  @PrimaryColumn({ name: 'orderid', type: 'int' })
  orderID: number;

  @PrimaryColumn({ name: 'productid', type: 'int' })
  productID: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productid' })
  product: Product;

  @ManyToOne(() => Order, (order) => order.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderid' })
  order: Order;

  @Column({ name: 'quantity_product', type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 16, nullable: true })
  size: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  mood: string;

  @Column({ type: 'boolean', default: false })
  feedback: boolean;
}
