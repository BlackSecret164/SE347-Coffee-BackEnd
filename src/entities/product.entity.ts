// Thêm thư viện này để hỗ trợ JSON column
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { OrderDetails } from './order-details.entity';
import { ProductMaterial } from './product-material.entity';
import { ProductSize } from './product_size.entity';
import { Rating } from './rating.entity';
import { ProductBranch } from './product_branch.entity';

@Entity({ name: 'product' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  category: string;

  @Column({ length: 255 })
  image: string;

  @Column({ length: 255 })
  description: string;

  @Column({ default: true })
  available: boolean;

  @Column({ type: 'boolean', default: false })
  hot: boolean;

  @Column({ type: 'boolean', default: false })
  cold: boolean;

  @Column({ name: 'ispopular', type: 'boolean', default: false })
  isPopular: boolean;

  @Column({ name: 'isnew', type: 'boolean', default: false })
  isNew: boolean;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'Hệ thống',
    comment: 'Phạm vi sản phẩm: "Hệ thống" hoặc "Chi nhánh"'
  })
  scope: string;

  @OneToMany(() => ProductMaterial, (pm) => pm.product)
  productMaterials: ProductMaterial[];

  @OneToMany(() => OrderDetails, (orderDetails) => orderDetails.product)
  orderDetails: OrderDetails[];

  @OneToMany(() => ProductSize, (size) => size.product, { cascade: true })
  sizes: ProductSize[];

  @OneToMany(() => Rating, (rating) => rating.product)
  ratings: Rating[];

  @OneToMany(() => ProductBranch, (pb) => pb.product)
  productBranches: ProductBranch[];
}
