import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Customer } from './customer.entity';
import { Product } from './product.entity';
import { Branch } from './branches.entity';

@Entity('cart_item')
export class CartItem {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  @IsNumber()
  quantity: number;

  @Column()
  @ApiProperty()
  @IsString()
  size: string;

  @Column()
  @ApiProperty()
  @IsString()
  mood: string;

  @Column({ name: 'phonecustomer' })
  @ApiProperty({ description: 'Phone number of customer' })
  @IsString()
  phoneCustomer: string;

  @Column({ name: 'productid' })
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  productId: number;

  @ManyToOne(() => Customer, (customer) => customer.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'phonecustomer', referencedColumnName: 'phone' })
  customer: Customer;

  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productid' })
  product: Product;

  @ManyToOne(() => Branch, {nullable: true})
  @JoinColumn({ name: 'branchid' })
  branch: Branch;

  @Column({ name: 'branchid', type: 'int' })
  branchId: number;
}
