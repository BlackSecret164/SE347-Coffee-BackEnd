import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from 'src/entities/staff.entity';
import { StaffDto, UpdateStaffDto } from 'src/dtos/staff.dto';

@Injectable()
export class BranchStaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async findAllByBranch(branchId: number): Promise<Staff[]> {
    return this.staffRepository.find({ where: { branchId: branchId } });
  }

  async findAll(branchId: number) {
  return this.staffRepository.find({ where: { branch: { id: branchId } } });
    }


  async findOneByBranch(id: number, branchId: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id, branchId: branchId } });
    if (!staff) throw new NotFoundException(`Staff ID ${id} not found in your branch`);
    return staff;
  }

  async create(staffDto: StaffDto, branchId: number): Promise<Staff> {
    const staff = this.staffRepository.create({ ...staffDto, branchId: branchId });
    return this.staffRepository.save(staff);
  }

  async update(id: number, updateDto: UpdateStaffDto, branchId: number): Promise<Staff> {
    const staff = await this.findOneByBranch(id, branchId);
    Object.assign(staff, updateDto);

    if (staff.workHours && staff.minsalary) {
      staff.salary = staff.workHours * staff.minsalary;
    }

    return this.staffRepository.save(staff);
  }

  async remove(id: number, branchId: number): Promise<void> {
    const staff = await this.findOneByBranch(id, branchId);
    await this.staffRepository.remove(staff);
  }
}
