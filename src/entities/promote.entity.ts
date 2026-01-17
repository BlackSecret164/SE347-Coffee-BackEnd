import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Coupon } from './coupon.entity';
import { Branch } from './branches.entity';

@Entity({ name: 'promote' })
export class Promote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', length: 20, nullable: true })
  name: string;

  @Column({ name: 'description', length: 20, nullable: true })
  description: string;

  @Column({ name: 'discount', type: 'int', nullable: true })
  discount: number;

  @Column({ name: 'promotetype', length: 20, nullable: true })
  promoteType: string;

  @Column({ name: 'startat', type: 'timestamp', nullable: true })
  startAt: Date;

  @Column({ name: 'endat', type: 'timestamp', nullable: true })
  endAt: Date;

  @Column({ name: 'branch_id', type: 'int', nullable: true })
  branchId: number;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToMany(() => Coupon, (coupon) => coupon.promote)
  coupons: Coupon[];
}
