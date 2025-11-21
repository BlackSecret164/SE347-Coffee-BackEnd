import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Promote } from '../entities/promote.entity';
import { Repository } from 'typeorm';
import { PromoteDto } from '../dtos/promote.dto';

@Injectable()
export class PromoteService {
  constructor(
    @InjectRepository(Promote)
    private readonly repo: Repository<Promote>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const promote = await this.repo.findOne({ where: { id } });
    if (!promote) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promote;
  }

  create(dto: PromoteDto) {
    const promote = this.repo.create(dto);
    return this.repo.save(promote);
  }

  async update(id: number, dto: PromoteDto) {
    const promote = await this.repo.findOne({ where: { id } });
    if (!promote) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
  
    // Cập nhật từng trường nếu có trong DTO
    Object.assign(promote, dto);
  
    return this.repo.save(promote);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return result;
  }
}
