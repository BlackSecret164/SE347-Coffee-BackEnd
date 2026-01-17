import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Promote } from '../entities/promote.entity';
import { Repository, IsNull } from 'typeorm';
import { PromoteDto } from '../dtos/promote.dto';

@Injectable()
export class PromoteService {
  constructor(
    @InjectRepository(Promote)
    private readonly repo: Repository<Promote>,
  ) {}

  /**
   * Lấy danh sách promote theo role và branchId
   * - ADMIN_SYSTEM: Chỉ xem promote chung (branchId = null)
   * - ADMIN_BRAND/STAFF: Xem promote chung VÀ của chi nhánh mình
   */
  async findAll(userRole?: string, branchId?: number) {
    if (userRole === 'ADMIN_SYSTEM') {
      // ADMIN_SYSTEM chỉ xem promote chung
      return this.repo.find({ 
        where: { branchId: IsNull() },
        relations: ['branch']
      });
    } else if (branchId) {
      // ADMIN_BRAND/STAFF xem promote chung VÀ của chi nhánh
      return this.repo
        .createQueryBuilder('promote')
        .leftJoinAndSelect('promote.branch', 'branch')
        .where('promote.branchId IS NULL OR promote.branchId = :branchId', { branchId })
        .getMany();
    }
    
    // Fallback: Trả về tất cả (không nên xảy ra)
    return this.repo.find({ relations: ['branch'] });
  }

  async findOne(id: number) {
    const promote = await this.repo.findOne({ 
      where: { id },
      relations: ['branch']
    });
    if (!promote) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promote;
  }

  /**
   * Tạo promote
   * - ADMIN_SYSTEM: Tạo promote chung (branchId = null)
   * - ADMIN_BRAND: Tạo promote cho chi nhánh của mình
   */
  create(dto: PromoteDto, userRole?: string, branchId?: number) {
    const promote = this.repo.create({
      ...dto,
      branchId: userRole === 'ADMIN_SYSTEM' ? null : branchId,
    });
    return this.repo.save(promote);
  }

  /**
   * Cập nhật promote
   * - ADMIN_SYSTEM: Chỉ sửa promote chung
   * - ADMIN_BRAND: Chỉ sửa promote của chi nhánh mình (không sửa được promote chung)
   */
  async update(id: number, dto: PromoteDto, userRole?: string, branchId?: number) {
    const promote = await this.repo.findOne({ where: { id } });
    if (!promote) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    // Kiểm tra quyền: ADMIN_BRAND không sửa đưức promote chung
    if (userRole === 'ADMIN_BRAND' && promote.branchId === null) {
      throw new ForbiddenException('Bạn không có quyền sửa promote chung');
    }

    // Kiểm tra ADMIN_BRAND chỉ sửa promote của chi nhánh mình
    if (userRole === 'ADMIN_BRAND' && promote.branchId !== branchId) {
      throw new ForbiddenException('Bạn chỉ có thể sửa promote của chi nhánh mình');
    }
  
    // Cập nhật từng trường nếu có trong DTO
    Object.assign(promote, dto);
  
    return this.repo.save(promote);
  }

  /**
   * Xóa promote
   * - ADMIN_SYSTEM: Chỉ xóa promote chung
   * - ADMIN_BRAND: Chỉ xóa promote của chi nhánh mình (không xóa được promote chung)
   */
  async remove(id: number, userRole?: string, branchId?: number) {
    const promote = await this.repo.findOne({ where: { id } });
    if (!promote) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    // Kiểm tra quyền: ADMIN_BRAND không xóa được promote chung
    if (userRole === 'ADMIN_BRAND' && promote.branchId === null) {
      throw new ForbiddenException('Bạn không có quyền xóa promote chung');
    }

    // Kiểm tra ADMIN_BRAND chỉ xóa promote của chi nhánh mình
    if (userRole === 'ADMIN_BRAND' && promote.branchId !== branchId) {
      throw new ForbiddenException('Bạn chỉ có thể xóa promote của chi nhánh mình');
    }

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return result;
  }
}
