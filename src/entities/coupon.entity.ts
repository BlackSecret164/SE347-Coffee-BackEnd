import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Promote } from './promote.entity';

@Entity({ name: 'coupon' })
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 20 })
  status: string;

  @ManyToOne(() => Promote, (promote) => promote.coupons, { eager: false })
  @JoinColumn({ name: 'promoteid' }) 
  promote: Promote;
}
