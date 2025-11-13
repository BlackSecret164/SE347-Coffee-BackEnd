import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('product_size')
export class ProductSize {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'ID của size sản phẩm' })
  id: number;

  @Column({ name: 'sizename', type: 'varchar', length: 10 })
  @ApiProperty({ example: 'M', description: 'Tên size (S, M, L)' })
  sizeName: string;

  @Column({ type: 'int' })
  @ApiProperty({ example: 25000, description: 'Giá của size sản phẩm' })
  price: number;

  @Column({name: 'productid', type: 'int'})
  @ApiProperty({ example: 1 })
  productId: number;

  @ManyToOne(() => Product, (product) => product.sizes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productid' })
  product: Product;
}
