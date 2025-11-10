import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from '../entities/tables.entity';
import { TableDto } from '../dtos/tables.dto';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  async findAll(branchId: number): Promise<Table[]> {
    return this.tableRepository.find({
      where: { branchId: branchId },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number, branchId: number): Promise<Table> {
    const table = await this.tableRepository.findOne({
      where: { id, branchId: branchId },
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found in your branch`);
    }
    return table;
  }

  async create(tableDto: TableDto, branchId: number): Promise<Table> {
    const table = this.tableRepository.create({
      ...tableDto,
      branchId: branchId,
    });
    return this.tableRepository.save(table);
  }

  async update(id: number, tableDto: Partial<TableDto>, branchId: number): Promise<Table> {
    const table = await this.findOne(id, branchId);
    Object.assign(table, {
      ...tableDto,
      bookingTime: tableDto.bookingTime || null,
      seatingTime: tableDto.seatingTime || null,
    });
    return this.tableRepository.save(table);
  }

  async completeTable(id: number, branchId: number): Promise<Table> {
    const table = await this.findOne(id, branchId);
    table.status = 'Available';
    table.phoneOrder = null;
    table.name = null;
    table.bookingTime = null;
    table.seatingTime = null;
    return this.tableRepository.save(table);
  }

  async remove(id: number, branchId: number): Promise<void> {
    const table = await this.findOne(id, branchId);
    await this.tableRepository.remove(table);
  }
}
