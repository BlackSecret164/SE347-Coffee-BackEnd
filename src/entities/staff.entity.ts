import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { WorkShift } from './workshift.entity';
import { Role } from './role.entity';
import { Order } from './order_tb.entity';
import { ActivityLog } from './activity_log.entity';
import { Branch } from './branches.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birth: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 15 })
  phone: string;

  @Column({ type: 'int', name: 'workshiftid', nullable: true })
  workshifId: number;

  @ManyToOne(() => WorkShift, (workShift) => workShift.staff)
  @JoinColumn({ name: 'workshiftid' })
  workShift: WorkShift;

  @Column({ type: 'int', name: 'workhours', default: 0 })
  workHours: number;

  @Column({ type: 'int', default: 3000000 })
  salary: number;

  @Column({ type: 'int', name: 'minsalary', default: 30000 })
  minsalary: number;

  @Column({ type: 'varchar', name: 'typestaff', length: 50, nullable: true })
  typeStaff: string;

  @Column({ type: 'date', name: 'startdate', nullable: true })
  startDate: Date;

  @Column({ type: 'boolean', name: 'activestatus', default: true })
  activeStatus: boolean;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'int', name: 'roleid', nullable: true })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.staff)
  @JoinColumn({ name: 'roleid' })
  roleEntity: Role;

  @Column({ type: 'varchar', length: 15 })
  role: string; // ADMIN_SYSTEM | ADMIN_BRAND | STAFF

  @Column({ type: 'int', name: 'branchid', nullable: true })
  branchId: number;

  @Column({ length: 255 })
  image: string;

  @ManyToOne(() => Branch, (branch) => branch.staff, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branchid' })
  branch: Branch;

  @OneToMany(() => Order, (order) => order.staff)
  orders: Order[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.staff)
  activityLogs: ActivityLog[];
}
