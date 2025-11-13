import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'membership' })
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 15, nullable: true })
  rank: string;

  @Column({ name: 'mprice', type: 'int', nullable: true })
  mPrice: number;

  @Column({ type: 'int', nullable: true })
  discount: number;
}
