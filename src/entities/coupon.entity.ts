import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Promote } from './promote.entity';
import { Branch } from './branches.entity';

@Entity({ name: 'coupon' })
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 20 })
  status: string;

  @Column({ name: 'branch_id', type: 'int', nullable: true })
  branchId: number;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Promote, (promote) => promote.coupons, { eager: false })
  @JoinColumn({ name: 'promoteid' }) 
  promote: Promote;
}
