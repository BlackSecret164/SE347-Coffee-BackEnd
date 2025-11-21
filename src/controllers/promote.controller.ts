import { Controller, Get, Post, Param, Body, Delete, Put, NotFoundException, UseGuards } from '@nestjs/common';
import { PromoteService } from '../services/promote.service';
import { PromoteDto } from '../dtos/promote.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CouponService } from '../services/coupon.service';
import { CouponDto } from '../dtos/coupon.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/RoleGuard';
import { Role } from 'src/guards/RoleDecorator';
import { EnumRoles } from 'src/enums/role.enum';

@ApiTags('Promote')
@Controller('promote')
export class PromoteController {
  constructor(
    private readonly promoteService: PromoteService,
    private readonly couponService: CouponService,
  ) {}

  // --- PROMOTE ---

  @Get('/list')
  @ApiOperation({ summary: 'Get list of all promotions' })
  @ApiResponse({ status: 200, description: 'List of promotions' })
  findAll() {
    return this.promoteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a promotion by ID' })
  @ApiResponse({ status: 200, description: 'Promotion found by ID' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async findOne(@Param('id') id: number) {
    const promote = await this.promoteService.findOne(id);
    if (!promote) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promote;
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM])
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({ status: 201, description: 'Promotion created successfully' })
  create(@Body() dto: PromoteDto) {
    return this.promoteService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM])
  @ApiOperation({ summary: 'Update a promotion by ID' })
  @ApiResponse({ status: 200, description: 'Promotion updated successfully' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async update(@Param('id') id: number, @Body() dto: PromoteDto) {
    const updatedPromote = await this.promoteService.update(id, dto);
    if (!updatedPromote) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return updatedPromote;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM])
  @ApiOperation({ summary: 'Delete a promotion by ID' })
  @ApiResponse({ status: 204, description: 'Promotion deleted successfully' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async remove(@Param('id') id: number) {
    const result = await this.promoteService.remove(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return;
  }

  // --- COUPON ---

  @Get('/coupon/list')
  @ApiOperation({ summary: 'Get list of all coupons' })
  @ApiResponse({ status: 200, description: 'List of coupons' })
  findAllCoupons() {
    return this.couponService.findAll();
  }

  @Get('/coupon/:id')
  @ApiOperation({ summary: 'Get a coupon by ID' })
  @ApiResponse({ status: 200, description: 'Coupon found by ID' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async findCoupon(@Param('id') id: number) {
    const coupon = await this.couponService.findOne(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  @Post('/coupon')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM])
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  createCoupon(@Body() dto: CouponDto) {
    return this.couponService.create(dto);
  }

  @Put('/coupon/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM])
  @ApiOperation({ summary: 'Update a coupon by ID' })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async updateCoupon(@Param('id') id: number, @Body() dto: CouponDto) {
    const updatedCoupon = await this.couponService.update(id, dto);
    if (!updatedCoupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return updatedCoupon;
  }

  @Delete('/coupon/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM])
  @ApiOperation({ summary: 'Delete a coupon by ID' })
  @ApiResponse({ status: 204, description: 'Coupon deleted successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async removeCoupon(@Param('id') id: number) {
    const result = await this.couponService.remove(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return;
  }
}
