import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchMaterial } from '../entities/branch_material.entity';
import { Repository } from 'typeorm';
import { CreateBranchMaterialDto, UpdateBranchMaterialDto } from '../dtos/branch_material.dto';

@Injectable()
export class BranchMaterialService {
    constructor(
        @InjectRepository(BranchMaterial)
        private readonly branchMaterialRepo: Repository<BranchMaterial>,
    ) { }

    async findByBranchId(branchId: number) {
        const materials = await this.branchMaterialRepo.find({
            where: { branch: { id: branchId } },
            relations: ['branch', 'rawMaterial'],
            order: { id: 'ASC' }, // nếu muốn sắp xếp theo id
        });

        return materials.map((material) => ({
            id: material.id,
            quantityImported: material.quantityImported,
            quantityStock: material.quantityStock,
            importDate: material.importDate,
            expiryDate: material.expiryDate,
            branch: {
                id: material.branch.id,
                name: material.branch.name,
            },
            rawMaterial: {
                id: material.rawMaterial.id,
                name: material.rawMaterial.name,
                price: material.rawMaterial.price,
                storageType: material.rawMaterial.storageType,
            },
        }));
    }

    async findOneByIdForBranch(branchId: number, id: number) {
        const material = await this.branchMaterialRepo.findOne({
            where: { id, branch: { id: branchId } },
            relations: ['branch', 'rawMaterial'],
        });
        if (!material) throw new NotFoundException('BranchMaterial not found or not yours');

        return {
            id: material.id,
            quantityImported: material.quantityImported,
            quantityStock: material.quantityStock,
            importDate: material.importDate,
            expiryDate: material.expiryDate,
            branch: {
                id: material.branch.id,
                name: material.branch.name,
            },
            rawMaterial: {
                id: material.rawMaterial.id,
                name: material.rawMaterial.name,
                price: material.rawMaterial.price,
                storageType: material.rawMaterial.storageType,
            },
        };
    }

    async createForBranch(branchId: number, dto: CreateBranchMaterialDto): Promise<BranchMaterial> {
        const entity = this.branchMaterialRepo.create({
            ...dto,
            branch: { id: branchId },
            importDate: new Date(dto.importDate),
            expiryDate: new Date(dto.expiryDate),
        });
        return this.branchMaterialRepo.save(entity);
    }

    async updateForBranch(branchId: number, id: number, dto: UpdateBranchMaterialDto): Promise<BranchMaterial> {
        const entity = await this.branchMaterialRepo.findOne({
            where: { id, branch: { id: branchId } },
        });
        if (!entity) throw new NotFoundException('BranchMaterial not found or not yours');
        return this.branchMaterialRepo.save({ ...entity, ...dto });
    }

    async removeForBranch(branchId: number, id: number): Promise<{ message: string }> {
        const entity = await this.branchMaterialRepo.findOne({
            where: { id, branch: { id: branchId } },
        });
        if (!entity) throw new NotFoundException('BranchMaterial not found or not yours');
        await this.branchMaterialRepo.remove(entity);
        return { message: 'BranchMaterial deleted successfully' };
    }
}
