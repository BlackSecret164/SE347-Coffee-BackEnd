import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from '../entities/membership.entity';
import { Repository } from 'typeorm';
import { CreateMembershipDto } from '../dtos/membership.dto';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,
  ) {}

  async findAll(): Promise<Membership[]> {
    return this.membershipRepo.find({ order: { id: 'ASC' } });
  }

  async findByRank(rank: string): Promise<Membership> {
    const membership = await this.membershipRepo.findOne({ where: { rank } });
    if (!membership) {
      throw new NotFoundException(`Membership with rank "${rank}" not found`);
    }
    return membership;
  }

  async create(dto: CreateMembershipDto): Promise<Membership> {
    const newMembership = this.membershipRepo.create(dto);
    return this.membershipRepo.save(newMembership);
  }

  async update(id: number, dto: CreateMembershipDto): Promise<Membership> {
    const membership = await this.membershipRepo.findOne({ where: { id } });
    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }
    Object.assign(membership, dto);
    return this.membershipRepo.save(membership);
  }

  async remove(id: number): Promise<void> {
    const result = await this.membershipRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }
  }
}
