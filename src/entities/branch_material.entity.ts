import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Branch } from './branches.entity';
import { RawMaterial } from './rawmaterial.entity';

@Entity('branch_material')
export class BranchMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'quantityimported', type: 'int' })
  quantityImported: number;

  @Column({ name: 'quantitystock', type: 'int' })
  quantityStock: number;

  @Column({ name: 'importdate', type: 'date' })
  importDate: Date;

  @Column({ name: 'expirydate', type: 'date' })
  expiryDate: Date;

  @ManyToOne(() => RawMaterial, (material) => material.branchMaterials, { eager: true })
  @JoinColumn({ name: 'rawmaterialid' })
  rawMaterial: RawMaterial;

  @ManyToOne(() => Branch, (branch) => branch.branchMaterials, { eager: true })
  @JoinColumn({ name: 'branchid' })
  branch: Branch;
}
