import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Product } from './product.entity';
import { RawMaterial } from './rawmaterial.entity';

@Entity({ name: 'product_material' })
export class ProductMaterial {
  @PrimaryColumn({ name: 'productid' })
  productId: number;

  @PrimaryColumn({ name: 'materialid' })
  materialId: number;

  @ManyToOne(() => Product, (product) => product.productMaterials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productid' })
  product: Product;

  @ManyToOne(() => RawMaterial, (rawMaterial) => rawMaterial.productMaterials, {
    eager: true,
  })
  @JoinColumn({ name: 'materialid' })
  rawMaterial: RawMaterial;

  @Column({ name: 'materialquantity', type: 'numeric' })
  materialQuantity: number;
}
