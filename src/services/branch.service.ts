import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from '../entities/branches.entity';
import { Repository } from 'typeorm';
import { CreateBranchDto } from '../dtos/branches.dto';
import { ProductBranch } from '../entities/product_branch.entity';
import { Product } from '../entities/product.entity';
import { RawMaterial } from '../entities/rawmaterial.entity';
import { BranchMaterial } from '../entities/branch_material.entity';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductBranch)
    private readonly productBranchRepo: Repository<ProductBranch>,
    @InjectRepository(RawMaterial)
    private rawMaterialRepo: Repository<RawMaterial>,
    @InjectRepository(BranchMaterial)
    private readonly branchMaterialRepo: Repository<BranchMaterial>,
  ) { }

  async findAll(): Promise<Branch[]> {
    return this.branchRepo.find({
      relations: ['manager'], // Load quan hệ manager
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        createdAt: true,
        manager: {
          id: true,
          name: true,
          phone: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepo.findOne({
      where: { id },
      relations: ['manager'],
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        createdAt: true,
        manager: {
          id: true,
          name: true,
          phone: true,
        },
      },
    });
    if (!branch) throw new NotFoundException(`Branch with id ${id} not found`);
    return branch;
  }

  async create(dto: CreateBranchDto): Promise<Branch> {
    const newBranch = this.branchRepo.create(dto);
    const branch = await this.branchRepo.save(newBranch);

    // Lấy tất cả sản phẩm hiện có
    const products = await this.productRepo.find();

    // Tạo các bản ghi ProductBranch tương ứng
    const productBranches = products.map((product) => {
      const pb = new ProductBranch();
      pb.branch = branch;
      pb.product = product;
      pb.available = true; // hoặc false tuỳ theo logic của bạn
      return pb;
    });

    // Lưu các bản ghi product_branch
    await this.productBranchRepo.save(productBranches);

    const rawmaterials = await this.rawMaterialRepo.find();

    const branchMaterials = rawmaterials.map((rawMaterial) => {
      const entry = new BranchMaterial();
      entry.rawMaterial = rawMaterial;
      entry.branch = branch;
      entry.quantityImported = 0;
      entry.quantityStock = 0;
      entry.importDate = new Date(); // có thể null nếu muốn
      entry.expiryDate = new Date(); // có thể null nếu muốn
      return entry;
    });

    await this.branchMaterialRepo.save(branchMaterials);

    return branch;
  }


  async update(id: number, dto: CreateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    const updated = this.branchRepo.merge(branch, dto);
    return this.branchRepo.save(updated);
  }

  async remove(id: number): Promise<{ message: string }> {
    const branch = await this.findOne(id);
    await this.branchRepo.remove(branch);
    return { message: 'Branch deleted successfully' };
  }
}
