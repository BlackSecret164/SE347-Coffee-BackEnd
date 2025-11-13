import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Order } from './order_tb.entity';
import { Rating } from './rating.entity';
import { CartItem } from './cart_item.entity';

@Entity({ name: 'customer' })
export class Customer {
  @PrimaryColumn({ name: 'phone', length: 15 })
  phone: string;

  @Column({ name: 'id', type: 'int', default: 0 })
  id: number;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'gender', length: 10, nullable: true })
  gender: string;

  @Column({ name: 'total', type: 'int', default: 0 })
  total: number;

  @Column({ name: 'registrationdate', type: 'timestamp', nullable: true })
  registrationDate: Date;

  @Column({ name: 'rank', length: 10, nullable: true })
  rank: string;

  @Column({ length: 255 })
  image: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => Rating, (rating) => rating.customer)
  ratings: Rating[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.customer)
  cartItems: CartItem[];
}
