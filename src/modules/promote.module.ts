import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoteController } from '../controllers/promote.controller';
import { PromoteService } from '../services/promote.service';
import { CouponService } from '../services/coupon.service';
import { Promote } from '../entities/promote.entity';
import { Coupon } from '../entities/coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promote, Coupon])],
  controllers: [PromoteController],
  providers: [PromoteService, CouponService],
})
export class PromoteModule {}
