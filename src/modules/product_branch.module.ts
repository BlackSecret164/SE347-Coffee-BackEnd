import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBranch } from '../entities/product_branch.entity';
import { ProductBranchService } from '../services/product_branch.service';
import { ProductBranchController } from '../controllers/product_branch.controller';
import { Product } from '../entities/product.entity';
import { Branch } from '../entities/branches.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductBranch, Product, Branch])],
  providers: [ProductBranchService],
  controllers: [ProductBranchController],
})
export class ProductBranchModule {}
