import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductService } from '../services/product.service';
import { ProductController } from '../controllers/product.controller';
import { ProductSize } from '../entities/product_size.entity';
import { ProductBranch } from 'src/entities/product_branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductSize, ProductBranch])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule],
})
export class ProductModule {}
