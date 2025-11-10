import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable } from 'typeorm';
import { Product } from './product.entity';
import { ProductMaterial } from './product-material.entity';
import { BranchMaterial } from './branch_material.entity';

@Entity('rawmaterial')
export class RawMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'storagetype',
    type: 'varchar',
    length: 20,
  })
  storageType: string; // e.g. CẤP ĐÔNG, ĐỂ NGOÀI

  @OneToMany(() => BranchMaterial, (branchMaterial) => branchMaterial.rawMaterial)
  branchMaterials: BranchMaterial[];

  @OneToMany(() => ProductMaterial, (pm) => pm.rawMaterial)
  productMaterials: ProductMaterial[];
}