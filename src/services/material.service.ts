import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawMaterial } from '../entities/rawmaterial.entity';
import { RawMaterialDto } from '../dtos/rawmaterial.dto';
import { Branch } from 'src/entities/branches.entity';
import { BranchMaterial } from 'src/entities/branch_material.entity';

@Injectable()
export class RawMaterialService {
  constructor(
    @InjectRepository(RawMaterial)
    private rawMaterialRepository: Repository<RawMaterial>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,

    @InjectRepository(BranchMaterial)
    private readonly branchMaterialRepo: Repository<BranchMaterial>,
  ) { }

  async findAll(): Promise<RawMaterial[]> {
    return await this.rawMaterialRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<RawMaterial> {
    const rawMaterial = await this.rawMaterialRepository.findOne({ where: { id } });
    if (!rawMaterial) {
      throw new NotFoundException(`Raw material with ID ${id} not found`);
    }
    return rawMaterial;
  }

  async create(dto: RawMaterialDto): Promise<RawMaterial> {
    const newMaterial = this.rawMaterialRepository.create(dto);
    const savedMaterial = await this.rawMaterialRepository.save(newMaterial);

    // Lấy tất cả các chi nhánh hiện có
    const branches = await this.branchRepo.find();

    // Tạo danh sách các bản ghi BranchMaterial tương ứng
    const branchMaterials = branches.map((branch) => {
      const entry = new BranchMaterial();
      entry.rawMaterial = savedMaterial;
      entry.branch = branch;
      entry.quantityImported = 0;
      entry.quantityStock = 0;
      entry.importDate = new Date(); // có thể null nếu muốn
      entry.expiryDate = new Date(); // có thể null nếu muốn
      return entry;
    });

    // Lưu vào database
    await this.branchMaterialRepo.save(branchMaterials);

    return savedMaterial;
  }

  async update(id: number, rawMaterialDto: RawMaterialDto): Promise<RawMaterial> {
    const material = await this.findOne(id);
    const updated = this.rawMaterialRepository.merge(material, rawMaterialDto);
    return this.rawMaterialRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const rawMaterial = await this.findOne(id);
    await this.rawMaterialRepository.remove(rawMaterial);
  }
}
