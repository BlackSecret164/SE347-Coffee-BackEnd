import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Product } from './product.entity';
import { Branch } from './branches.entity';

@Entity({ name: 'product_branch' })
@Unique(['product', 'branch'])
export class ProductBranch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'productid', type: 'int'})
  productId: number;

  @Column({name: 'branchid', type: 'int'})
  branchId: number;

  @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productid' })
  product: Product;

  @ManyToOne(() => Branch, (branch) => branch.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchid' })
  branch: Branch;

  @Column({ default: true })
  available: boolean;
}

