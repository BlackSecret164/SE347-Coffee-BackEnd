import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from '../entities/coupon.entity';
import { Repository } from 'typeorm';
import { CouponDto } from '../dtos/coupon.dto';
import { Promote } from '../entities/promote.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,

    @InjectRepository(Promote)
    private readonly promoteRepo: Repository<Promote>,
  ) {}

  async findAll() {
    return this.couponRepo.find({ relations: ['promote'] });
  }

  async findOne(id: number) {
    const coupon = await this.couponRepo.findOne({
      where: { id },
      relations: ['promote'],
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async create(dto: CouponDto) {
    const promote = await this.promoteRepo.findOne({ where: { id: dto.promoteId } });
    if (!promote) {
      throw new NotFoundException(`Promote with ID ${dto.promoteId} not found`);
    }

    const coupon = this.couponRepo.create({
      code: dto.code,
      status: dto.status,
      promote,
    });

    return this.couponRepo.save(coupon);
  }

  async update(id: number, dto: CouponDto) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    const promote = await this.promoteRepo.findOne({ where: { id: dto.promoteId } });
    if (!promote) {
      throw new NotFoundException(`Promote with ID ${dto.promoteId} not found`);
    }

    coupon.code = dto.code;
    coupon.status = dto.status;
    coupon.promote = promote;

    return this.couponRepo.save(coupon);
  }

  async remove(id: number) {
    const result = await this.couponRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return result;
  }
}
