import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Staff } from './staff.entity';

@Entity()
export class WorkShift {
  @PrimaryGeneratedColumn()
  workShiftId: number;

  @Column({ length: 50 })
  shiftName: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @OneToMany(() => Staff, staff => staff.workShift)
  staff: Staff[];
}
