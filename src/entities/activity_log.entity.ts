import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Staff } from './staff.entity';

@Entity({ name: 'activity_logs' })
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Staff, staff => staff.activityLogs, { nullable: false, onDelete: 'CASCADE' })
  staff: Staff;

  @Column({ type: 'text' })
  action: string;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
