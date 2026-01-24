import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductBranch } from '../entities/product_branch.entity';
import {
  CreateProductBranchDto,
  UpdateProductBranchStatusDto,
} from '../dtos/product_branch.dto';
import { Product } from '../entities/product.entity';
import { Branch } from '../entities/branches.entity';

@Injectable()
export class ProductBranchService {
  constructor(
    @InjectRepository(ProductBranch)
    private readonly productBranchRepo: Repository<ProductBranch>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) { }

  async findAll(branchId: number) {
    const records = await this.productBranchRepo.find({
      where: {
        branch: { id: branchId },
        product: { available: true }, // Lọc sản phẩm chỉ khi còn mở bán chung toàn hệ thống
      },
      relations: [
        'product',
        'product.sizes',
        'product.productMaterials',
        'product.productMaterials.rawMaterial',
        'branch',
      ],
    });

    return records.map((record) => ({
      id: record.id.toString(), // ID của bảng product_branch
      productId: record.product.id, // Giữ lại productId nếu cần
      name: record.product.name,
      category: record.product.category,
      description: record.product.description,
      image: record.product.image,
      available: record.available, // Trạng thái tại chi nhánh
      hot: record.product.hot,
      cold: record.product.cold,
      isPopular: record.product.isPopular,
      isNew: record.product.isNew,
      scope: record.product.scope,
      sizes: record.product.sizes.map((s) => ({
        sizeName: s.sizeName,
        price: s.price,
      })),
      materials: record.product.productMaterials.map((pm) => ({
        id: pm.materialId,
        materialId: pm.materialId,
        materialQuantity: pm.materialQuantity,
        quantity: pm.materialQuantity,
        name: pm.rawMaterial.name,
      })),
      branch: {
        id: record.branch.id,
        name: record.branch.name,
        address: record.branch.address,
        phone: record.branch.phone,
        createdAt: record.branch.createdAt,
      },
    }));
  }

  async findOne(id: number, branchId: number) {
    const record = await this.productBranchRepo.findOne({
      where: { id, branch: { id: branchId } },
      relations: [
        'product',
        'product.sizes',
        'product.productMaterials',
        'product.productMaterials.rawMaterial',
        'branch',
      ],
    });

    if (!record) {
      throw new NotFoundException(`ProductBranch with ID ${id} not found in your branch`);
    }

    return {
      id: record.id.toString(), // ID của bảng product_branch
      productId: record.product.id,
      name: record.product.name,
      category: record.product.category,
      description: record.product.description,
      image: record.product.image,
      available: record.available,
      hot: record.product.hot,
      cold: record.product.cold,
      isPopular: record.product.isPopular,
      isNew: record.product.isNew,
      scope: record.product.scope,
      sizes: record.product.sizes.map((s) => ({
        sizeName: s.sizeName,
        price: s.price,
      })),
      materials: record.product.productMaterials.map((pm) => ({
        id: pm.materialId,
        materialId: pm.materialId,
        materialQuantity: pm.materialQuantity,
        quantity: pm.materialQuantity,
        name: pm.rawMaterial.name,
      })),
      branch: {
        id: record.branch.id,
        name: record.branch.name,
        address: record.branch.address,
        phone: record.branch.phone,
        createdAt: record.branch.createdAt,
      },
    };
  }

  async create(dto: CreateProductBranchDto, branchId: number) {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });

    if (!product || !branch) throw new NotFoundException('Product or Branch not found');

    const newRecord = this.productBranchRepo.create({
      product,
      branch,
      available: dto.available,
    });

    return this.productBranchRepo.save(newRecord);
  }

  // async findOne(id: number, branchId: number) {
  //   const record = await this.productBranchRepo.findOne({
  //     where: { id, branch: { id: branchId } },
  //     relations: ['product', 'branch'],
  //   });
  //   if (!record) {
  //     throw new NotFoundException(`ProductBranch with ID ${id} not found in your branch`);
  //   }
  //   return record;
  // }

  async updateAvailability(id: number, dto: UpdateProductBranchStatusDto, branchId: number) {
    const record = await this.productBranchRepo.findOne({
      where: { id, branch: { id: branchId } },
    });
    if (!record) throw new NotFoundException('ProductBranch not found in your branch');
    record.available = dto.available;
    return this.productBranchRepo.save(record);
  }

  async remove(id: number, branchId: number) {
    const result = await this.productBranchRepo.delete({ id, branch: { id: branchId } });
    if (result.affected === 0) {
      throw new NotFoundException(`ProductBranch with ID ${id} not found in your branch`);
    }
  }
}
