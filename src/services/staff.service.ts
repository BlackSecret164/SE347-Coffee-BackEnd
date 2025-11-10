import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { StaffDto, UpdateStaffDto, UpdateStaffBranchIdDto } from 'src/dtos/staff.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) { }

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find();
  }

  async findOne(id: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id },
    });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  async create(staffDto: StaffDto): Promise<Staff> {
    const staff = this.staffRepository.create(staffDto);
    return this.staffRepository.save(staff);
  }

  async update(id: number, staffDto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(id);

    // Cập nhật thông tin
    Object.assign(staff, staffDto);

    // Tính lại lương nếu có workHours và minsalary
    if (staff.workHours && staff.minsalary) {
      staff.salary = staff.workHours * staff.minsalary;
    }

    return this.staffRepository.save(staff);
  }

  async updateBranchId(id: number, dto: UpdateStaffBranchIdDto) {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Staff not found');

    staff.branchId = dto.branchId;
    await this.staffRepository.save(staff);

    return { message: 'StaffBranch updated' };
  }

  async remove(id: number): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
  }

  async findByBranch(branchId: number): Promise<Staff[]> {
    return this.staffRepository.find({ where: { branchId } });
  }
}
