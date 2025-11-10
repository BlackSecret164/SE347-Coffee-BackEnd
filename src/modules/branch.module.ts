import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../entities/branches.entity';
import { BranchService } from '../services/branch.service';
import { BranchController } from '../controllers/branch.controller';
import { ProductModule } from '../modules/product.module';
import { ProductBranch } from '../entities/product_branch.entity';
import { BranchMaterial } from '../entities/branch_material.entity';
import { BranchMaterialModule } from './branch_material.module';
import { RawMaterial } from '../entities/rawmaterial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, ProductBranch, BranchMaterial, RawMaterial,]), ProductModule, BranchMaterialModule,],
  providers: [BranchService],
  controllers: [BranchController],
})
export class BranchModule {}
