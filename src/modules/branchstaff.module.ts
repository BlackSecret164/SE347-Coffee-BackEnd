import { Module } from '@nestjs/common';
import { BranchStaffService } from '../services/branchstaff.service';
import { BranchStaffController } from '../controllers/branchstaff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from 'src/entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  providers: [BranchStaffService],
  controllers: [BranchStaffController],
})
export class BranchStaffModule {}
