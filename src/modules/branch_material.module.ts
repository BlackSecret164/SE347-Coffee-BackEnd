import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchMaterial } from '../entities/branch_material.entity';
import { BranchMaterialService } from '../services/branch_material.service';
import { BranchMaterialController } from '../controllers/branch_material.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BranchMaterial])],
  controllers: [BranchMaterialController],
  providers: [BranchMaterialService],
  exports: [BranchMaterialService],
})
export class BranchMaterialModule {}
