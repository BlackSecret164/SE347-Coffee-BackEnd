import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from '../entities/coupon.entity';
import { Repository, IsNull } from 'typeorm';
import { CouponDto } from '../dtos/coupon.dto';
import { Promote } from '../entities/promote.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,

    @InjectRepository(Promote)
    private readonly promoteRepo: Repository<Promote>,
  ) {}

  /**
   * Lấy danh sách coupon theo role và branchId
   * - ADMIN_SYSTEM: Chỉ xem coupon chung (branchId = null)
   * - ADMIN_BRAND/STAFF: Xem coupon chung VÀ của chi nhánh mình
   */
  async findAll(userRole?: string, branchId?: number) {
    if (userRole === 'ADMIN_SYSTEM') {
      // ADMIN_SYSTEM chỉ xem coupon chung
      return this.couponRepo.find({ 
        where: { branchId: IsNull() },
        relations: ['promote', 'branch']
      });
    } else if (branchId) {
      // ADMIN_BRAND/STAFF xem coupon chung VÀ của chi nhánh
      return this.couponRepo
        .createQueryBuilder('coupon')
        .leftJoinAndSelect('coupon.promote', 'promote')
        .leftJoinAndSelect('coupon.branch', 'branch')
        .where('coupon.branchId IS NULL OR coupon.branchId = :branchId', { branchId })
        .getMany();
    }
    
    // Fallback
    return this.couponRepo.find({ relations: ['promote', 'branch'] });
  }

  async findOne(id: number) {
    const coupon = await this.couponRepo.findOne({
      where: { id },
      relations: ['promote', 'branch'],
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  /**
   * Kiểm tra mã coupon theo code string
   * - Endpoint này cho phép Customer/Guest sử dụng
   * - Chỉ trả về coupon đang hoạt động
   */
  async findByCode(code: string, branchId?: number) {
    if (!code || code.trim() === '') {
      throw new BadRequestException('Mã giảm giá không được để trống');
    }

    // Tìm coupon theo code (có thể là coupon chung hoặc của chi nhánh cụ thể)
    const queryBuilder = this.couponRepo
      .createQueryBuilder('coupon')
      .leftJoinAndSelect('coupon.promote', 'promote')
      .leftJoinAndSelect('coupon.branch', 'branch')
      .where('UPPER(coupon.code) = UPPER(:code)', { code: code.trim() });

    // Nếu có branchId, cho phép coupon chung hoặc coupon của chi nhánh đó
    if (branchId) {
      queryBuilder.andWhere(
        '(coupon.branchId IS NULL OR coupon.branchId = :branchId)',
        { branchId }
      );
    } else {
      // Nếu không có branchId, chỉ lấy coupon chung
      queryBuilder.andWhere('coupon.branchId IS NULL');
    }

    const coupon = await queryBuilder.getOne();

    if (!coupon) {
      throw new NotFoundException('Mã giảm giá không tồn tại hoặc không áp dụng cho chi nhánh này');
    }

    // Kiểm tra trạng thái (case-insensitive) - chấp nhận các giá trị: Active, Hoạt động, Có hiệu lực
    const status = coupon.status?.toLowerCase().trim();
    const validStatuses = ['active', 'hoạt động', 'có hiệu lực'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Mã giảm giá đã hết hạn hoặc ngưng hoạt động');
    }

    // Kiểm tra thời gian khuyến mãi (nếu có)
    if (coupon.promote) {
      const now = new Date();
      const startDate = new Date(coupon.promote.startAt);
      const endDate = new Date(coupon.promote.endAt);

      if (now < startDate) {
        throw new BadRequestException('Chương trình khuyến mãi chưa bắt đầu');
      }

      if (now > endDate) {
        throw new BadRequestException('Chương trình khuyến mãi đã kết thúc');
      }
    }

    return coupon;
  }

  /**
   * Tạo coupon
   * - ADMIN_SYSTEM: Tạo coupon chung (branchId = null)
   * - ADMIN_BRAND: Tạo coupon cho chi nhánh của mình
   */
  async create(dto: CouponDto, userRole?: string, branchId?: number) {
    const promote = await this.promoteRepo.findOne({ where: { id: dto.promoteId } });
    if (!promote) {
      throw new NotFoundException(`Promote with ID ${dto.promoteId} not found`);
    }

    const coupon = this.couponRepo.create({
      code: dto.code,
      status: dto.status,
      promote,
      branchId: userRole === 'ADMIN_SYSTEM' ? null : branchId,
    });

    return this.couponRepo.save(coupon);
  }

  /**
   * Cập nhật coupon
   * - ADMIN_SYSTEM: Chỉ sửa coupon chung
   * - ADMIN_BRAND: Chỉ sửa coupon của chi nhánh mình (không sửa được coupon chung)
   */
  async update(id: number, dto: CouponDto, userRole?: string, branchId?: number) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    // Kiểm tra quyền: ADMIN_BRAND không sửa được coupon chung
    if (userRole === 'ADMIN_BRAND' && coupon.branchId === null) {
      throw new ForbiddenException('Bạn không có quyền sửa coupon chung');
    }

    // Kiểm tra ADMIN_BRAND chỉ sửa coupon của chi nhánh mình
    if (userRole === 'ADMIN_BRAND' && coupon.branchId !== branchId) {
      throw new ForbiddenException('Bạn chỉ có thể sửa coupon của chi nhánh mình');
    }

    const promote = await this.promoteRepo.findOne({ where: { id: dto.promoteId } });
    if (!promote) {
      throw new NotFoundException(`Promote with ID ${dto.promoteId} not found`);
    }

    coupon.code = dto.code;
    coupon.status = dto.status;
    coupon.promote = promote;

    return this.couponRepo.save(coupon);
  }

  /**
   * Xóa coupon
   * - ADMIN_SYSTEM: Chỉ xóa coupon chung
   * - ADMIN_BRAND: Chỉ xóa coupon của chi nhánh mình (không xóa được coupon chung)
   */
  async remove(id: number, userRole?: string, branchId?: number) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    // Kiểm tra quyền: ADMIN_BRAND không xóa được coupon chung
    if (userRole === 'ADMIN_BRAND' && coupon.branchId === null) {
      throw new ForbiddenException('Bạn không có quyền xóa coupon chung');
    }

    // Kiểm tra ADMIN_BRAND chỉ xóa coupon của chi nhánh mình
    if (userRole === 'ADMIN_BRAND' && coupon.branchId !== branchId) {
      throw new ForbiddenException('Bạn chỉ có thể xóa coupon của chi nhánh mình');
    }

    const result = await this.couponRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return result;
  }
}
