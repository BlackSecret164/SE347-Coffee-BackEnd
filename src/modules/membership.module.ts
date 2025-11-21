import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from '../entities/membership.entity';
import { MembershipService } from '../services/membership.service';
import { MembershipController } from '../controllers/membership.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Membership])],
  providers: [MembershipService],
  controllers: [MembershipController],
})
export class MembershipModule {}
